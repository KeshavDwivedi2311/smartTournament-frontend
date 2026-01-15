export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <header className="text-white p-4 sm:p-6 md:p-8 shadow-lg" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-center">
          🏸 Tourn-Pur
        </h1>
        <nav className="flex justify-center gap-2 sm:gap-4 md:gap-6 flex-wrap max-w-4xl mx-auto">
          <button className="nav-btn text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">Tournaments</button>
          <button className="nav-btn text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">Players</button>
          <button className="nav-btn text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">Matches</button>
          <button className="nav-btn text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">Rankings</button>
        </nav>
      </header>

      <main className="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}