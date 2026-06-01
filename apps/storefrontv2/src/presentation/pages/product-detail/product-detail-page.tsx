import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { productByHandleQueryOptions } from "@/application/products.queries";
import { Eyebrow } from "@/components/brand/eyebrow";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductActions } from "@/modules/products/product-actions";

export function ProductPage() {
	const { countryCode, handle } = useParams({ from: "/$countryCode/_storefront/products/$handle" });
	const { data: product } = useSuspenseQuery(
		productByHandleQueryOptions(handle, countryCode),
	);

	if (!product) {
		return null;
	}

	const images = product.images ?? [];

	return (
		<div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-10">
			<div className="flex flex-col gap-4">
				<div className="aspect-square overflow-hidden rounded-2xl border border-border bg-surface-inset">
					{product.thumbnail || images[0] ? (
						<img
							src={product.thumbnail ?? images[0]?.url}
							alt={product.title}
							className="size-full object-cover"
						/>
					) : null}
				</div>
				{images.length > 1 && (
					<div className="grid grid-cols-4 gap-3">
						{images.slice(0, 8).map((image) => (
							<div
								key={image.id}
								className="aspect-square overflow-hidden rounded-md border border-border bg-surface-inset"
							>
								<img
									src={image.url}
									alt={product.title}
									className="size-full object-cover"
									loading="lazy"
								/>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					{product.collection ? (
						<Eyebrow>{product.collection.title}</Eyebrow>
					) : null}
					<h1 className="text-h3 font-bold tracking-tight text-foreground">
						{product.title}
					</h1>
					{product.subtitle ? (
						<p className="text-lead text-muted-foreground">
							{product.subtitle}
						</p>
					) : null}
				</div>

				{product.description ? (
					<p className="text-base leading-relaxed text-muted-foreground">
						{product.description}
					</p>
				) : null}

				<ProductActions product={product} />

				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="details">
						<AccordionTrigger>Product information</AccordionTrigger>
						<AccordionContent>
							<dl className="grid grid-cols-2 gap-2.5 text-sm">
								<dt className="font-mono text-mono-label uppercase text-muted-foreground">
									Material
								</dt>
								<dd className="font-medium">{product.material || "—"}</dd>
								<dt className="font-mono text-mono-label uppercase text-muted-foreground">
									Country of origin
								</dt>
								<dd className="font-medium">{product.origin_country || "—"}</dd>
								<dt className="font-mono text-mono-label uppercase text-muted-foreground">
									Type
								</dt>
								<dd className="font-medium">{product.type?.value || "—"}</dd>
								<dt className="font-mono text-mono-label uppercase text-muted-foreground">
									Weight
								</dt>
								<dd className="font-medium">
									{product.weight ? `${product.weight} g` : "—"}
								</dd>
							</dl>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="shipping">
						<AccordionTrigger>Shipping & returns</AccordionTrigger>
						<AccordionContent className="text-sm text-muted-foreground">
							Fast delivery with simple, free returns within 30 days.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}
