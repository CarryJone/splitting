// Native Node.js Handler (Zero Dependency)
// If this times out, Vercel is completely broken for this project.

export default function handler(request, response) {
    console.log('[DEBUG] Native Handler Hit!');
    response.status(200).json({
        status: 'alive',
        message: 'Native Node.js Handler is working',
        timestamp: new Date().toISOString()
    });
}
