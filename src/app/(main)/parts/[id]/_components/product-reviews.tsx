import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, CheckCircle } from "lucide-react"

interface ProductReviewsProps {
  reviews: Array<{
    id: number
    user: string
    rating: number
    date: string
    comment: string
    verified: boolean
  }>
  rating: number
}

export function ProductReviews({ reviews, rating }: ProductReviewsProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Customer Reviews</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">{renderStars(Math.round(rating))}</div>
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground">({reviews.length} reviews)</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{review.user.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.user}</span>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              </div>

              {review.id !== reviews[reviews.length - 1].id && <div className="border-b border-border" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
