import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { UserInfo } from '@/components/user-info'
import { useMobileNavigation } from '@/hooks/use-mobile-navigation'
import { type User } from '@/types'
import { Link } from '@inertiajs/react'
import { LogOut, Settings } from 'lucide-react'

interface UserMenuContentProps {
  user: User
}

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation()

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
          <UserInfo user={user} showEmail />
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            href={route('profile.edit')}
            prefetch
            as="button"
            onClick={cleanup}
            className="w-full flex items-center"
          >
            <Settings className="mr-2 size-4" />
            Paramètres
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <Link
          method="post"
          href={route('logout')}
          as="button"
          onClick={cleanup}
          className="w-full flex items-center"
        >
          <LogOut className="mr-2 size-4" />
          Se déconnecter
        </Link>
      </DropdownMenuItem>
    </>
  )
}
