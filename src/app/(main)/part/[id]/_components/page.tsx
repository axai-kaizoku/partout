import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { ProductGallery } from '@/components/product-gallery';
import { ProductInfo } from '@/components/product-info';
import { SellerInfo } from '@/components/seller-info';
import { CompatibilityTable } from '@/components/compatibility-table';
import { RelatedParts } from '@/components/related-parts';
import { ProductReviews } from '@/components/product-reviews';
import { notFound } from 'next/navigation';

// Mock data - in real app this would come from database
const mockParts = {
	'1': {
		id: 1,
		title: 'BMW E46 Brake Pads - Front Set',
		price: 89.99,
		originalPrice: 120.0,
		condition: 'New',
		brand: 'BMW',
		model: 'E46 3 Series',
		year: '1999-2006',
		partNumber: '34116761280',
		description:
			'High-quality OEM replacement brake pads for BMW E46 3 Series. These brake pads provide excellent stopping power and durability. Made from premium materials with low dust formula for cleaner wheels.',
		images: [
			'/placeholder.svg?height=400&width=400&text=BMW+Brake+Pads+1',
			'/placeholder.svg?height=400&width=400&text=BMW+Brake+Pads+2',
			'/placeholder.svg?height=400&width=400&text=BMW+Brake+Pads+3',
		],
		seller: {
			id: 1,
			name: 'AutoParts Pro',
			rating: 4.8,
			reviewCount: 1247,
			verified: true,
			location: 'Los Angeles, CA',
			memberSince: '2019',
			responseTime: '< 1 hour',
			totalSales: 3420,
			avatar: '/placeholder.svg?height=60&width=60&text=AP',
		},
		negotiable: true,
		category: 'Brake System',
		compatibility: [
			{ make: 'BMW', model: '320i', year: '1999-2006', engine: '2.2L' },
			{ make: 'BMW', model: '323i', year: '1999-2006', engine: '2.5L' },
			{ make: 'BMW', model: '325i', year: '1999-2006', engine: '2.5L' },
			{ make: 'BMW', model: '328i', year: '1999-2006', engine: '2.8L' },
			{ make: 'BMW', model: '330i', year: '1999-2006', engine: '3.0L' },
		],
		specifications: {
			'Part Number': '34116761280',
			Brand: 'BMW OEM',
			Material: 'Ceramic',
			Warranty: '2 Years',
			Weight: '2.5 lbs',
			Dimensions: '12.5 x 5.2 x 0.8 inches',
		},
		shipping: {
			cost: 12.99,
			estimatedDays: '3-5 business days',
			freeShippingThreshold: 100,
		},
		reviews: [
			{
				id: 1,
				user: 'Mike R.',
				rating: 5,
				date: '2024-01-15',
				comment:
					'Perfect fit for my 2003 BMW 325i. Great quality and fast shipping!',
				verified: true,
			},
			{
				id: 2,
				user: 'Sarah K.',
				rating: 4,
				date: '2024-01-10',
				comment:
					'Good brake pads, much better than the aftermarket ones I had before.',
				verified: true,
			},
		],
	},
	'2': {
		id: 1,
		title: 'BMW E46 Brake Pads - Front Set',
		price: 89.99,
		originalPrice: 120.0,
		condition: 'New',
		brand: 'BMW',
		model: 'E46 3 Series',
		year: '1999-2006',
		partNumber: '34116761280',
		description:
			'High-quality OEM replacement brake pads for BMW E46 3 Series. These brake pads provide excellent stopping power and durability. Made from premium materials with low dust formula for cleaner wheels.',
		images: [
			'/placeholder.svg?height=400&width=400&text=BMW+Brake+Pads+1',
			'/placeholder.svg?height=400&width=400&text=BMW+Brake+Pads+2',
			'/placeholder.svg?height=400&width=400&text=BMW+Brake+Pads+3',
		],
		seller: {
			id: 1,
			name: 'AutoParts Pro',
			rating: 4.8,
			reviewCount: 1247,
			verified: true,
			location: 'Los Angeles, CA',
			memberSince: '2019',
			responseTime: '< 1 hour',
			totalSales: 3420,
			avatar: '/placeholder.svg?height=60&width=60&text=AP',
		},
		negotiable: true,
		category: 'Brake System',
		compatibility: [
			{ make: 'BMW', model: '320i', year: '1999-2006', engine: '2.2L' },
			{ make: 'BMW', model: '323i', year: '1999-2006', engine: '2.5L' },
			{ make: 'BMW', model: '325i', year: '1999-2006', engine: '2.5L' },
			{ make: 'BMW', model: '328i', year: '1999-2006', engine: '2.8L' },
			{ make: 'BMW', model: '330i', year: '1999-2006', engine: '3.0L' },
		],
		specifications: {
			'Part Number': '34116761280',
			Brand: 'BMW OEM',
			Material: 'Ceramic',
			Warranty: '2 Years',
			Weight: '2.5 lbs',
			Dimensions: '12.5 x 5.2 x 0.8 inches',
		},
		shipping: {
			cost: 12.99,
			estimatedDays: '3-5 business days',
			freeShippingThreshold: 100,
		},
		reviews: [
			{
				id: 1,
				user: 'Mike R.',
				rating: 5,
				date: '2024-01-15',
				comment:
					'Perfect fit for my 2003 BMW 325i. Great quality and fast shipping!',
				verified: true,
			},
			{
				id: 2,
				user: 'Sarah K.',
				rating: 4,
				date: '2024-01-10',
				comment:
					'Good brake pads, much better than the aftermarket ones I had before.',
				verified: true,
			},
		],
	},
};

export default function ProductDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const part = mockParts[params.id as keyof typeof mockParts];

	if (!part) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<main className="pb-20">
				<div className="max-w-6xl mx-auto px-4 py-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
						{/* Product Gallery */}
						<ProductGallery images={part.images} title={part.title} />

						{/* Product Info */}
						<ProductInfo part={part} />
					</div>

					{/* Seller Info */}
					<div className="mb-8">
						<SellerInfo seller={part.seller} />
					</div>

					{/* Compatibility Table */}
					<div className="mb-8">
						<CompatibilityTable compatibility={part.compatibility} />
					</div>

					{/* Reviews */}
					<div className="mb-8">
						<ProductReviews
							reviews={part.reviews}
							rating={part.seller.rating}
						/>
					</div>

					{/* Related Parts */}
					<RelatedParts currentPartId={part.id} category={part.category} />
				</div>
			</main>

			<BottomNav />
		</div>
	);
}
