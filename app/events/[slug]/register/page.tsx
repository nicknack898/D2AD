import RegisterClient from "./register-client"

export default function RegisterPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  return <RegisterClient slug={slug} />
}
