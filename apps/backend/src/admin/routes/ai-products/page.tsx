import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  StatusBadge,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/client"

type PriceQuote = {
  price: number
  currency: string
  source_url: string
  source_name: string
}

type PriceSuggestion =
  | {
      available: true
      min_price: number
      avg_price: number
      max_price: number
      currency: string
      confidence: number
      sources: PriceQuote[]
    }
  | { available: false; unavailable_reason: string; sources: PriceQuote[] }

type ResearchData = {
  research: {
    brand: string | null
    brand_logo_url: string | null
    model: string | null
    category_suggestion: string | null
    colors: string[]
    sizes: string[]
  }
  sources: { url: string; title: string }[]
}

type AiProductRequest = {
  id: string
  input_name: string
  status:
    | "pending"
    | "researching"
    | "generating"
    | "translating"
    | "pricing"
    | "creating_product"
    | "completed"
    | "failed"
  research_data: ResearchData | null
  price_suggestion: PriceSuggestion | null
  product_id: string | null
  brand_id: string | null
  error: string | null
  created_at: string
}

const ACTIVE_STATUSES = [
  "pending",
  "researching",
  "generating",
  "translating",
  "pricing",
  "creating_product",
]

const STATUS_LABELS: Record<AiProductRequest["status"], string> = {
  pending: "En cola",
  researching: "Investigando",
  generating: "Generando contenido",
  translating: "Traduciendo",
  pricing: "Analizando precios",
  creating_product: "Creando borrador",
  completed: "Completado",
  failed: "Fallido",
}

const statusColor = (
  status: AiProductRequest["status"]
): "green" | "red" | "blue" => {
  if (status === "completed") return "green"
  if (status === "failed") return "red"
  return "blue"
}

const PriceReference = ({
  suggestion,
}: {
  suggestion: PriceSuggestion | null
}) => {
  if (!suggestion) {
    return (
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        —
      </Text>
    )
  }
  if (!suggestion.available) {
    return (
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        Sin precio verificable
      </Text>
    )
  }
  return (
    <Text size="small" leading="compact">
      {suggestion.avg_price} {suggestion.currency}{" "}
      <span className="text-ui-fg-subtle">
        ({suggestion.min_price}–{suggestion.max_price} · conf.{" "}
        {Math.round(suggestion.confidence * 100)}%)
      </span>
    </Text>
  )
}

const BrandSection = ({
  request,
  onConfirm,
  isConfirming,
}: {
  request: AiProductRequest
  onConfirm: (name: string, logoUrl: string | null) => void
  isConfirming: boolean
}) => {
  const research = request.research_data?.research
  const detectedName = research?.brand ?? ""
  const [name, setName] = useState(detectedName)

  // Already linked: show a confirmation, nothing to do.
  if (request.brand_id) {
    return (
      <div className="flex flex-col gap-1">
        <Text size="small" leading="compact" weight="plus">
          Marca
        </Text>
        <StatusBadge color="green">Marca asociada</StatusBadge>
      </div>
    )
  }

  // No product yet (still running / failed) → can't associate.
  if (!request.product_id) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <Text size="small" leading="compact" weight="plus">
        Marca
      </Text>
      {detectedName ? (
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Detectada: <span className="text-ui-fg-base">{detectedName}</span>.
          Revísala (puedes corregirla) y crea/asóciala. Si ya existe se reutiliza.
        </Text>
      ) : (
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          No se detectó marca. Escríbela manualmente para crear/asociar, o
          déjalo en blanco para omitir.
        </Text>
      )}
      {research?.brand_logo_url && (
        <img
          src={research.brand_logo_url}
          alt={detectedName || "logo"}
          className="h-10 w-auto max-w-[120px] rounded border border-ui-border-base bg-ui-bg-base object-contain p-1"
        />
      )}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nombre de la marca"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button
          size="small"
          variant="secondary"
          isLoading={isConfirming}
          disabled={isConfirming || name.trim().length < 2}
          onClick={() =>
            onConfirm(name.trim(), research?.brand_logo_url ?? null)
          }
        >
          Crear / asociar
        </Button>
      </div>
    </div>
  )
}

const RequestDetailDrawer = ({
  request,
  onClose,
  onConfirmBrand,
  isConfirmingBrand,
}: {
  request: AiProductRequest | null
  onClose: () => void
  onConfirmBrand: (name: string, logoUrl: string | null) => void
  isConfirmingBrand: boolean
}) => {
  const research = request?.research_data?.research
  const suggestion = request?.price_suggestion

  return (
    <Drawer open={!!request} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{request?.input_name}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-4 overflow-y-auto">
          {request?.error && (
            <div>
              <Text size="small" leading="compact" weight="plus">
                Error
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-error">
                {request.error}
              </Text>
            </div>
          )}

          {research && (
            <div className="flex flex-col gap-1">
              <Text size="small" leading="compact" weight="plus">
                Producto identificado
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {[research.brand, research.model].filter(Boolean).join(" ") ||
                  "—"}
                {research.category_suggestion
                  ? ` · ${research.category_suggestion}`
                  : ""}
              </Text>
              {(research.colors.length > 0 || research.sizes.length > 0) && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {research.colors.map((c) => (
                    <Badge key={`c-${c}`} size="2xsmall">
                      {c}
                    </Badge>
                  ))}
                  {research.sizes.map((s) => (
                    <Badge key={`s-${s}`} size="2xsmall" color="blue">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {request && (
            <BrandSection
              key={request.id}
              request={request}
              onConfirm={onConfirmBrand}
              isConfirming={isConfirmingBrand}
            />
          )}

          <div className="flex flex-col gap-1">
            <Text size="small" leading="compact" weight="plus">
              Precio de referencia de mercado
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Promedio de precios reales encontrados online (competidores, en
              su moneda original). No es tu precio de venta: revísalo y fija el
              precio manualmente en el borrador.
            </Text>
            <PriceReference suggestion={suggestion ?? null} />
            {suggestion && suggestion.sources.length > 0 && (
              <div className="flex flex-col gap-1 pt-1">
                {suggestion.sources.map((source) => (
                  <a
                    key={source.source_url}
                    href={source.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ui-fg-interactive txt-small truncate"
                  >
                    {source.source_name}: {source.price} {source.currency}
                  </a>
                ))}
              </div>
            )}
          </div>

          {request?.research_data?.sources && (
            <div className="flex flex-col gap-1">
              <Text size="small" leading="compact" weight="plus">
                Fuentes consultadas
              </Text>
              {request.research_data.sources.slice(0, 10).map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ui-fg-interactive txt-small truncate"
                >
                  {source.title || source.url}
                </a>
              ))}
            </div>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          {request?.product_id && (
            <Button size="small" variant="secondary" asChild>
              <Link to={`/products/${request.product_id}`}>
                Revisar borrador
              </Link>
            </Button>
          )}
          <Button size="small" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const AiProductsPage = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [selected, setSelected] = useState<AiProductRequest | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["ai-product-requests"],
    queryFn: () =>
      sdk.client.fetch<{ ai_product_requests: AiProductRequest[] }>(
        "/admin/ai-products?limit=50"
      ),
    // Poll while any job is still running so progress is visible live.
    refetchInterval: (query) =>
      query.state.data?.ai_product_requests.some((r) =>
        ACTIVE_STATUSES.includes(r.status)
      )
        ? 3000
        : false,
  })

  const createMutation = useMutation({
    mutationFn: (productName: string) =>
      sdk.client.fetch("/admin/ai-products", {
        method: "POST",
        body: { name: productName },
      }),
    onSuccess: () => {
      setName("")
      toast.success("Generación iniciada", {
        description: "El borrador estará listo en 1–2 minutos.",
      })
      queryClient.invalidateQueries({ queryKey: ["ai-product-requests"] })
    },
    onError: (error: Error) => {
      toast.error("No se pudo iniciar", { description: error.message })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/ai-products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-product-requests"] })
    },
    onError: (error: Error) => {
      toast.error("No se pudo eliminar", { description: error.message })
    },
  })

  const brandMutation = useMutation({
    mutationFn: (vars: { id: string; name: string; logo_url: string | null }) =>
      sdk.client.fetch<{ ai_product_request: AiProductRequest }>(
        `/admin/ai-products/${vars.id}/brand`,
        {
          method: "POST",
          body: { name: vars.name, logo_url: vars.logo_url },
        }
      ),
    onSuccess: (data) => {
      toast.success("Marca asociada")
      // Reflect the new brand_id immediately in the open drawer.
      setSelected(data.ai_product_request)
      queryClient.invalidateQueries({ queryKey: ["ai-product-requests"] })
    },
    onError: (error: Error) => {
      toast.error("No se pudo asociar la marca", { description: error.message })
    },
  })

  const requests = data?.ai_product_requests ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-1 px-6 py-4">
        <Heading level="h1">Creación de productos con IA</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Ingresa el nombre de un producto real (p. ej. “GAN 356 M”). El
          sistema lo investiga en la web, genera el contenido en español e
          inglés y guarda un borrador para tu revisión.
        </Text>
      </div>

      <form
        className="flex items-center gap-2 px-6 py-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim().length >= 3) {
            createMutation.mutate(name.trim())
          }
        }}
      >
        <Input
          placeholder="Nombre del producto, p. ej. Nike Air Zoom Pegasus 41"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button
          size="small"
          type="submit"
          isLoading={createMutation.isPending}
          disabled={createMutation.isPending || name.trim().length < 3}
        >
          Generar borrador
        </Button>
      </form>

      <div className="px-6 py-4">
        {isLoading ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Cargando…
          </Text>
        ) : requests.length === 0 ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Aún no hay generaciones. Crea la primera arriba.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Producto</Table.HeaderCell>
                <Table.HeaderCell>Estado</Table.HeaderCell>
                <Table.HeaderCell>Precio referencia</Table.HeaderCell>
                <Table.HeaderCell>Creado</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {requests.map((request) => (
                <Table.Row
                  key={request.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(request)}
                >
                  <Table.Cell>{request.input_name}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={statusColor(request.status)}>
                      {STATUS_LABELS[request.status]}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <PriceReference suggestion={request.price_suggestion} />
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(request.created_at).toLocaleString("es-PE")}
                  </Table.Cell>
                  <Table.Cell onClick={(event) => event.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      {request.product_id && (
                        <Button size="small" variant="secondary" asChild>
                          <Link to={`/products/${request.product_id}`}>
                            Revisar borrador
                          </Link>
                        </Button>
                      )}
                      {!ACTIVE_STATUSES.includes(request.status) && (
                        <Button
                          size="small"
                          variant="danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(request.id)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      <RequestDetailDrawer
        request={selected}
        onClose={() => setSelected(null)}
        onConfirmBrand={(name, logoUrl) =>
          selected &&
          brandMutation.mutate({ id: selected.id, name, logo_url: logoUrl })
        }
        isConfirmingBrand={brandMutation.isPending}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "AI Products",
  icon: Sparkles,
})

export default AiProductsPage
