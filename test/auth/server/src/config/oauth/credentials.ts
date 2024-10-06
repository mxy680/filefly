export const googleCredentials = {
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
    scopes: ['https://www.googleapis.com/auth/drive', 'openid', 'email', 'profile'],
}