import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";

const RecentExpenses: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>DTF</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-medium leading-none">Din Tai Fung</p>
            <Badge variant="outline">Category 1</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Had lunch with baby at Toyosu
          </p>
        </div>
        <div className="ml-auto font-medium">-¥4,200</div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback>G</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-medium leading-none">Gucci</p>
            <Badge variant="outline">Category 2</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Bought a new bag for work</p>
        </div>
        <div className="ml-auto font-medium">-¥320,000</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/03.png" alt="Avatar" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-medium leading-none">Arcade</p>
            <Badge variant="outline">Category 2</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Tekken 7 at Akihabara
          </p>
        </div>
        <div className="ml-auto font-medium">-¥1,000</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/04.png" alt="Avatar" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-medium leading-none">Macarons</p>
            <Badge variant="outline">Category 1</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Bought sweets from Afternoon Tea</p>
        </div>
        <div className="ml-auto font-medium">-¥2,300</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/05.png" alt="Avatar" />
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-medium leading-none">Suica</p>
            <Badge variant="outline">Category 3</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Transport for train</p>
        </div>
        <div className="ml-auto font-medium">-¥3,000</div>
      </div>
    </div>
  )
}


export default RecentExpenses;
