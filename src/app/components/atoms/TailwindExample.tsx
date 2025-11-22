/**
 * Example Tailwind Component
 * Demonstrates Tailwind CSS usage in FaceKitten
 */

export function TailwindExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tailwind CSS Setup</h1>
        <p className="text-lg text-gray-600">Ready to build beautiful UIs!</p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-primary text-3xl mb-4">🎨</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Utility-First</h3>
          <p className="text-gray-600">Use pre-built utility classes for rapid UI development</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-secondary text-3xl mb-4">📱</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Responsive</h3>
          <p className="text-gray-600">Build mobile-first responsive designs easily</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-success text-3xl mb-4">⚡</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Fast</h3>
          <p className="text-gray-600">Minimal CSS bundle with production optimization</p>
        </div>
      </div>

      {/* Button Examples */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Examples</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition">
            Primary Button
          </button>
          <button className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition">
            Secondary Button
          </button>
          <button className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition">
            Secondary Style
          </button>
          <button className="px-6 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
            Outline Button
          </button>
        </div>
      </div>
    </div>
  )
}
