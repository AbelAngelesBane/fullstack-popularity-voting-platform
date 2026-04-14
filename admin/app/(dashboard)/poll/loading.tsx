import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PollsLoading() {
  return (
    <div className="flex min-h-screen p-4">
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div className="w-full flex flex-col space-y-4">
          <Skeleton className="h-8 w-48" /> 
          
          <div className="w-70 h-10">
            <Skeleton className="h-full w-full rounded-md" /> 
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-10 w-16" /> 
            <Skeleton className="h-10 w-20" /> 
            <Skeleton className="h-10 w-20" /> 
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="flex-1 py-8">
                <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-3/4" /> 
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20" /> 
                    <Skeleton className="h-4 w-32" /> 
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <Skeleton className="h-7 w-40" /> 
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-6 w-40" /> 
              <div className="grid grid-cols-3 gap-2">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-8 rounded-full" />
                 ))}
              </div>
            </div>

            <div className="space-y-2">
               <Skeleton className="h-6 w-24" />
               <Skeleton className="h-10 w-full" /> 
               <Skeleton className="h-10 w-full" /> 
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}