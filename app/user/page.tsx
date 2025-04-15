import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, Clock, FileText, Settings } from "lucide-react"

export default function UserHomePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">SFQS Ticket System</h1>
        <p className="text-xl text-gray-600">Submit and track support tickets for fixtures and systems</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Submit a Ticket
            </CardTitle>
            <CardDescription>Report an issue with a fixture or system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Create a new support ticket to report problems with fixtures, system blockages, functional issues, or
              other concerns.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/user/submit-ticket">Submit Ticket</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              View Tickets
            </CardTitle>
            <CardDescription>Check the status of existing tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              View all open tickets for your area, check their status, see assigned personnel, and track resolution
              progress.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/user/view-tickets">View Tickets</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Request Extra Time
            </CardTitle>
            <CardDescription>Request additional time with a technician</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Need more time with a technician? Submit a request for extra time and track its approval status.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/user/extra-time">Request Time</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Changelog
            </CardTitle>
            <CardDescription>Administra las entradas del changelog</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Crea y gestiona entradas de changelog para informar a los usuarios sobre actualizaciones y cambios en el
              sistema.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/user/changelog">Ver Changelog</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configuración
            </CardTitle>
            <CardDescription>Administra la configuración de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Cambia tu contraseña y administra la configuración de tu cuenta.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/user/settings">Ver Configuración</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
