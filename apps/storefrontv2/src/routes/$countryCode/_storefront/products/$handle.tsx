import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { productByHandleQueryOptions } from "@/application/products.queries";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductActions } from "@/modules/products/product-actions";

export const Route = createFileRoute(
	"/$countryCode/_storefront/products/$handle",
)({
	loader: async ({ context, params }) => {
		const product = await context.queryClient.ensureQueryData(
			productByHandleQueryOptions(params.handle, params.countryCode),
		);
		if (!product) {
			throw notFound();
		}
	},
	component: ProductPage,
});

function ProductPage() {
	const { countryCode, handle } = Route.useParams();
	const { data: product } = useSuspenseQuery(
		productByHandleQueryOptions(handle, countryCode),
	);

	if (!product) {
		return null;
	}

	const images = product.images ?? [];

	return (
		<div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-2">
			<div className="flex flex-col gap-4">
				<div className="aspect-square overflow-hidden rounded-lg bg-muted">
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
								className="aspect-square overflow-hidden rounded-md bg-muted"
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
				<div>
					{product.collection ? (
						<p className="text-sm text-muted-foreground">
							{product.collection.title}
						</p>
					) : null}
					<h1 className="text-3xl font-semibold tracking-tight">
						{product.title}
					</h1>
					{product.subtitle ? (
						<p className="mt-1 text-muted-foreground">{product.subtitle}</p>
					) : null}
				</div>

				{product.description ? (
					<p className="text-sm leading-relaxed text-muted-foreground">
						{product.description}
					</p>
				) : null}

				<ProductActions product={product} />

				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="details">
						<AccordionTrigger>Product information</AccordionTrigger>
						<AccordionContent>
							<dl className="grid grid-cols-2 gap-2 text-sm">
								<dt className="text-muted-foreground">Material</dt>
								<dd>{product.material || "-"}</dd>
								<dt className="text-muted-foreground">Country of origin</dt>
								<dd>{product.origin_country || "-"}</dd>
								<dt className="text-muted-foreground">Type</dt>
								<dd>{product.type?.value || "-"}</dd>
								<dt className="text-muted-foreground">Weight</dt>
								<dd>{product.weight ? `${product.weight} g` : "-"}</dd>
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
