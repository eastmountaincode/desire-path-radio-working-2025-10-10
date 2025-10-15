import Header from "../components/Header/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="p-7 pt-[60px]">
        {children}
      </main>
    </>
  )
}

