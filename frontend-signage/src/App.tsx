function App() {
  return (
    <div className="min-h-screen bg-signage-bg flex items-center justify-center">
      <div className="bg-signage-card rounded-2xl p-8 border-l-4 border-signage-green">
        <div className="bg-signage-green-bg text-signage-green text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
          ONGOING NOW
        </div>
        <h1 className="text-signage-text text-2xl font-bold mb-2">Theme Test</h1>
        <p className="text-signage-text-dim">Dark signage theme working</p>
      </div>
    </div>
  )
}

export default App