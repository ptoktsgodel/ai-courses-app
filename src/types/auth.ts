export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface LoginResponse {
  tokenType: string
  accessToken: string
  expiresIn: number
  refreshToken: string
}

export interface ApiValidationError {
  propertyName: string
  errorMessage: string
}
