import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [, setLocation] = useLocation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(username, password);
            // Logic to redirect is tricky here because login() is async but state update might be slightly delayed?
            // Actually, the login function in auth provider waits for response.
            // But we need to check the user role.
            // We can fetch the user or rely on the fact that login throws if failed.
            // Let's refactor to check role.
            // Since useAuth().user might not be updated immediately in this scope, 
            // we'll rely on the redirect inside AuthProvider or check it here.
            // Ideally we should know who logged in.
            // Let's check session or just assume user and let router handle redirection?
            // But we need to know WHERE to redirect. 
            // We can fetch session immediately again?
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            if (data.user?.role === "admin") {
                setLocation("/admin");
            } else {
                setLocation("/");
            }
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-purple-950 to-black p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1),transparent_50%)]" />

            <Card className="relative w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border-purple-500/20 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Tech Ascent
                    </h1>
                    <p className="text-gray-400">Inicia sesión para continuar tu aventura</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                            Usuario
                        </label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            required
                            className="w-full bg-white/5 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Contraseña
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                            className="w-full bg-white/5 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-400 transition-colors"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold py-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    <p>¿Eres administrador? Usa tus credenciales de admin</p>
                </div>
            </Card>
        </div>
    );
}
