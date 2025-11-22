const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key]
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`)
  }
  return value || defaultValue || ''
}

export const env = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME', 'FaceKitten'),
  APP_URL: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  API_URL: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),

  // Gemini API
  GEMINI_API_KEY: getEnv('GEMINI_API_KEY'),
  GEMINI_PROJECT_ID: getEnv('GEMINI_PROJECT_ID'),
  GEMINI_PROJECT_N: getEnv('GEMINI_PROJECT_N'),
}

export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'

