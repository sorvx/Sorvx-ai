import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

config({
  path: ".env.local",
})

/*const CA_CERT = `-----BEGIN CERTIFICATE-----
MIIETTCCArWgAwIBAgIUMVFwAcPyApGsBLG6qiEEuo9xfS8wDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1YjljYTBiMTItN2Y2My00YWQ3LTg0YTMtMjliZDkwNDhm
OWI0IEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwMjEzMDUyMzQyWhcNMzUwMjExMDUy
MzQyWjBAMT4wPAYDVQQDDDViOWNhMGIxMi03ZjYzLTRhZDctODRhMy0yOWJkOTA0
OGY5YjQgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBAPSbG8uy/BfmoEGs2i4NydoWj/aQIe8qEi9ZzBppvNCHWv/jid7Xb6D3
4kkxKchQAU2/50E5VJ5UwtFHjUSOtDUOzhJkaiHlCNkzVkaDmkvpbA5IIVB1hmmK
6ew+WDnm4BDu+WeqoWpC932QmWs+uqR0WzNacJ1du4IIUfFiVhclpAiJeKiwMv0I
KXbe3uw+EOtXnjViZyxg0F0gF5lkMSmFz3/BVCrUzgv0yJ4kpk8gOIP9X3LCrzwA
MIZd55JxMq+nX2cWnj1C5H3fSh8V12GkGkmrX+4kCblNMCufdGE9cgfq9wXApcd/
ERNkSCAa/gzP1OO4xKSuxKy3esS/JQxCZFc8J3ANJKwomR11pARoxHXIQLaY8YH5
a3+OcN94HFzhmEm9oItnYyqK1vv/S6Rpr7EuSGvbbAIqwnEYBmgFl0N4WbsNFkSB
cJ2Y3wSPIzK9262/UjM6eIvhMCWz5T81yhLQibBV6BNG9pphuq5whr2cUtCDshft
FbSKDbnIFQIDAQABoz8wPTAdBgNVHQ4EFgQUS3WgE5tkK7KnmFE66KzeqoV6gaAw
DwYDVR0TBAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGB
ANCXeqSPd33rpgMtYD8NoMpx1FSAse7UILYAO2nNZ8RHhEzVKjP2unZ8kW53ShwC
ydJiv+zPI+zLRGiX2fzQXG/mByqLslx+XtO0zeTDIoRId+YnfNJPasKuU7xQbafR
CHfsVOWq+yY/tpTMrAfPQv3eh7635vpD6WJwGYKYu2ElIw5LBcPenk1vagHaxTZf
3TxusBb7uutN+kiZGxOjmUqdRMQ8STJOV/Q1kx/IOIzWN/k8m9juI+ASKUnKZ8SR
mWIWCM09JEY+YxhEzHGAZXG41Me1XKJAy0L9IqI9KiQjK3uzahEtHi7ZQUmN9qGn
hAKfFeBICMho5jgSRcQgzZvHgOe/ybF5bLQz47WxbZe1JDiqgXOuZQ5uw3cHxeNj
y5j+Zh5rqXUL6GgEkQMhM7ICh1iVXSHZzEK552DupZ0jPPh+L68UqHhiqdqeCBE6
9KgV1smuotoqY6NP2a13ZWX7z0pI0wZaulo6HUSZG6vF4Pjf3iC586BnjGl5DRye
rA==
-----END CERTIFICATE-----`;*/

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined")
  }

  const connection = postgres(process.env.POSTGRES_URL, {
    max: 1,
    //ssl: { ca: CA_CERT }, // Explicitly pass the CA cert
  })

  const db = drizzle(connection)

  console.log("⏳ Running migrations...")

  try {
    const start = Date.now()
    await migrate(db, { migrationsFolder: "./lib/drizzle" })
    const end = Date.now()
    console.log("✅ Migrations completed in", end - start, "ms")
  } catch (error) {
    console.error("❌ Migration failed")
    console.error(error)
  } finally {
    await connection.end()
    process.exit(0)
  }
}

runMigrate().catch((err) => {
  console.error("❌ Migration failed")
  console.error(err)
  process.exit(1)
})

