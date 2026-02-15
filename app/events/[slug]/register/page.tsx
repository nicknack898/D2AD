import RegisterClient from "./register-client"

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <RegisterClient slug={slug} />
}
