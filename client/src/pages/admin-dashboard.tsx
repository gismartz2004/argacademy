import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
    Users,
    Map as MapIcon,
    Shield,
    Plus,
    Trash2,
    Settings,
    LogOut,
    Search,
    School,
    Save,
    BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("users");

    // User Management State
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });

    // World Management State
    const [isCreateWorldOpen, setIsCreateWorldOpen] = useState(false);
    const [newWorld, setNewWorld] = useState({ name: "", slug: "", description: "", imageUrl: "" });

    // Queries
    const { data: users = [] } = useQuery({
        queryKey: ["/api/admin/users"],
        queryFn: async () => {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
    });

    const { data: worlds = [] } = useQuery({
        queryKey: ["/api/worlds"],
        queryFn: async () => {
            const res = await fetch("/api/worlds");
            if (!res.ok) throw new Error("Failed to fetch worlds");
            return res.json();
        }
    });

    // Mutations
    const createUserMutation = useMutation({
        mutationFn: async (userData: typeof newUser) => {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create user");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            setIsCreateUserOpen(false);
            setNewUser({ username: "", password: "", role: "user" });
            toast({ title: "Usuario creado exitosamente" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const createWorldMutation = useMutation({
        mutationFn: async (worldData: typeof newWorld) => {
            const res = await fetch("/api/admin/worlds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(worldData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create world");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/worlds"] });
            setIsCreateWorldOpen(false);
            setNewWorld({ name: "", slug: "", description: "", imageUrl: "" });
            toast({ title: "Mundo creado exitosamente" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete user");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Usuario eliminado" });
        }
    });

    const assignProfessorMutation = useMutation({
        mutationFn: async ({ worldId, professorId }: { worldId: number, professorId: string }) => {
            const res = await fetch(`/api/admin/worlds/${worldId}/professor`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ professorId })
            });
            if (!res.ok) throw new Error("Failed to assign professor");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/worlds"] });
            toast({ title: "Profesor asignado correctamente" });
        },
        onError: () => {
            toast({ title: "Error al asignar profesor", variant: "destructive" });
        }
    });

    const handleLogout = async () => {
        await logout();
        setLocation("/login");
    };

    const professors = Array.isArray(users) ? users.filter((u: any) => u.role === "professor") : [];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Sidebar / Navigation */}
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-white/5 p-6 flex flex-col z-20">
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Admin Console</h1>
                        <p className="text-xs text-zinc-500">Tech Ascent v2.0</p>
                    </div>
                </div>

                <div className="space-y-2 flex-1">
                    <Button
                        variant={activeTab === "users" ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-12"
                        onClick={() => setActiveTab("users")}
                    >
                        <Users className="w-4 h-4" /> Usuarios
                    </Button>
                    <Button
                        variant={activeTab === "worlds" ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-12"
                        onClick={() => setActiveTab("worlds")}
                    >
                        <MapIcon className="w-4 h-4" /> Mundos
                    </Button>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.username}</p>
                            <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="pl-64">
                <header className="h-16 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between px-8">
                    <h2 className="font-semibold text-lg capitalize">{activeTab === "users" ? "Gestión de Usuarios" : "Asignación de Mundos"}</h2>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-white/10 bg-white/5"><Settings className="w-4 h-4" /></Button>
                    </div>
                </header>

                <main className="p-8 max-w-7xl mx-auto">

                    {/* USERS TAB */}
                    {activeTab === "users" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Usuarios del Sistema</h3>
                                    <p className="text-zinc-400">Administra cuentas de estudiantes, profesores y administradores.</p>
                                </div>
                                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-900/20">
                                            <Plus className="w-4 h-4" /> Nuevo Usuario
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-950 border-white/10 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                                            <DialogDescription className="text-zinc-400">Completa los datos para registrar un nuevo usuario en la plataforma.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">Usuario</label>
                                                <Input
                                                    value={newUser.username}
                                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                                    className="bg-black/50 border-white/10 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">Contraseña</label>
                                                <Input
                                                    type="password"
                                                    value={newUser.password}
                                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                    className="bg-black/50 border-white/10 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">Rol</label>
                                                <Select
                                                    value={newUser.role}
                                                    onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                                                >
                                                    <SelectTrigger className="bg-black/50 border-white/10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-white/10">
                                                        <SelectItem value="user">Estudiante (User)</SelectItem>
                                                        <SelectItem value="professor">Profesor</SelectItem>
                                                        <SelectItem value="admin">Administrador</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full bg-indigo-600 hover:bg-indigo-500"
                                            onClick={() => createUserMutation.mutate(newUser)}
                                            disabled={!newUser.username || !newUser.password}
                                        >
                                            {createUserMutation.isPending ? "Creando..." : "Crear Usuario"}
                                        </Button>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <Card className="bg-zinc-900/30 border-white/5">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/5 hover:bg-white/5">
                                            <TableHead className="text-zinc-400">Usuario</TableHead>
                                            <TableHead className="text-zinc-400">Rol</TableHead>
                                            <TableHead className="text-zinc-400">XP Total</TableHead>
                                            <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Array.isArray(users) && users.map((u: any) => (
                                            <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                                                <TableCell className="font-medium text-white">{u.username}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`
                                                ${u.role === 'admin' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' :
                                                            u.role === 'professor' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                                                                'border-zinc-700 text-zinc-400'} capitalize
                                            `}>
                                                        {u.role === 'user' ? 'Estudiante' : u.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-zinc-300">{u.totalXp}</TableCell>
                                                <TableCell className="text-right">
                                                    {u.id !== user?.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-red-500/10 hover:text-red-400 text-zinc-500 transition-colors"
                                                            onClick={() => deleteUserMutation.mutate(u.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    )}

                    {/* WORLDS TAB */}
                    {activeTab === "worlds" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Mundos y Asignaciones</h3>
                                    <p className="text-zinc-400">Gestiona los mundos y asigna profesores responsables.</p>
                                </div>
                                <Dialog open={isCreateWorldOpen} onOpenChange={setIsCreateWorldOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-900/20">
                                            <Plus className="w-4 h-4" /> Nuevo Mundo
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-950 border-white/10 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Crear Nuevo Mundo</DialogTitle>
                                            <DialogDescription className="text-zinc-400">Completa los datos para crear un nuevo mundo en la plataforma.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">Nombre del Mundo</label>
                                                <Input
                                                    value={newWorld.name}
                                                    onChange={(e) => {
                                                        const name = e.target.value;
                                                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                                        setNewWorld({ ...newWorld, name, slug });
                                                    }}
                                                    className="bg-black/50 border-white/10 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">Slug (URL)</label>
                                                <Input
                                                    value={newWorld.slug}
                                                    onChange={(e) => setNewWorld({ ...newWorld, slug: e.target.value })}
                                                    className="bg-black/50 border-white/10 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">Descripción</label>
                                                <Input
                                                    value={newWorld.description}
                                                    onChange={(e) => setNewWorld({ ...newWorld, description: e.target.value })}
                                                    className="bg-black/50 border-white/10 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">URL de la Imagen</label>
                                                <Input
                                                    value={newWorld.imageUrl}
                                                    onChange={(e) => setNewWorld({ ...newWorld, imageUrl: e.target.value })}
                                                    className="bg-black/50 border-white/10 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full bg-indigo-600 hover:bg-indigo-500"
                                            onClick={() => createWorldMutation.mutate(newWorld)}
                                            disabled={!newWorld.name || !newWorld.slug || !newWorld.description}
                                        >
                                            {createWorldMutation.isPending ? "Creando..." : "Crear Mundo"}
                                        </Button>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.isArray(worlds) && worlds.map((world: any) => (
                                    <WorldCard key={world.id} world={world} professors={professors} allUsers={users} />
                                ))}
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}

function WorldCard({ world, professors, allUsers }: { world: any, professors: any[], allUsers: any[] }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const students = allUsers.filter(u => u.role === "user");
    const [isManageLevelsOpen, setIsManageLevelsOpen] = useState(false);
    const [newContent, setNewContent] = useState({ level: 1, title: "", description: "", type: "pdf", fileUrl: "" });

    // Query for world students
    const { data: worldStudents = [] } = useQuery({
        queryKey: [`/api/worlds/${world.id}/students`],
        queryFn: async () => {
            const res = await fetch(`/api/worlds/${world.id}/students`);
            if (!res.ok) throw new Error("Failed to fetch students");
            return res.json();
        }
    });

    // Query for world content
    const { data: worldContent = [] } = useQuery({
        queryKey: [`/api/worlds/${world.id}/content`],
        queryFn: async () => {
            const res = await fetch(`/api/worlds/${world.id}/content`);
            if (!res.ok) throw new Error("Failed to fetch content");
            return res.json();
        },
        enabled: isManageLevelsOpen
    });

    const assignProfessorMutation = useMutation({
        mutationFn: async (professorId: string) => {
            const res = await fetch(`/api/admin/worlds/${world.id}/professor`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ professorId })
            });
            if (!res.ok) throw new Error("Failed to assign professor");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/worlds"] });
            toast({ title: "Profesor asignado" });
        }
    });

    const assignStudentMutation = useMutation({
        mutationFn: async (studentId: string) => {
            const res = await fetch(`/api/admin/worlds/${world.id}/students`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId })
            });
            if (!res.ok) throw new Error("Failed to assign student");
        },
        onSuccess: () => {
            toast({ title: "Estudiante asignado" });
        }
    });

    const createContentMutation = useMutation({
        mutationFn: async (contentData: typeof newContent) => {
            const res = await fetch(`/api/worlds/${world.id}/content`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contentData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create content");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/worlds/${world.id}/content`] });
            setNewContent({ level: 1, title: "", description: "", type: "pdf", fileUrl: "" });
            toast({ title: "Contenido creado exitosamente" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    return (
        <Card className="bg-zinc-900/30 border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="h-32 bg-zinc-800 relative overflow-hidden">
                <img src={world.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                <div className="absolute bottom-4 left-4">
                    <h4 className="font-bold text-xl text-white">{world.name}</h4>
                    <Badge className="bg-black/50 backdrop-blur border-white/10 text-xs">
                        {world.slug}
                    </Badge>
                </div>
            </div>
            <CardContent className="p-6 space-y-4">
                <p className="text-sm text-zinc-400 line-clamp-2 min-h-[40px]">{world.description}</p>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => setIsManageLevelsOpen(true)}
                    >
                        <BookOpen className="w-4 h-4" /> Gestionar Niveles
                    </Button>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <School className="w-3 h-3" /> Profesor Asignado
                    </label>
                    <Select
                        defaultValue={world.professorId?.toString()}
                        onValueChange={(val) => assignProfessorMutation.mutate(val)}
                    >
                        <SelectTrigger className="bg-black/20 border-white/10 focus:ring-0 focus:border-indigo-500">
                            <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                            {professors.length === 0 && <SelectItem value="none" disabled>No hay profesores creados</SelectItem>}
                            {professors.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>{p.username}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3 h-3" /> Estudiantes Asignados
                    </label>
                    <div className="flex flex-wrap gap-1">
                        {Array.isArray(worldStudents) && worldStudents.length === 0 && (
                            <p className="text-xs text-zinc-500">Ningún estudiante asignado</p>
                        )}
                        {Array.isArray(worldStudents) && worldStudents.map((studentId: string) => {
                            const student = allUsers.find(u => u.id === studentId);
                            return student ? (
                                <Badge key={studentId} variant="secondary" className="text-xs">
                                    {student.username}
                                </Badge>
                            ) : null;
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3 h-3" /> Asignar Estudiante
                    </label>
                    <Select onValueChange={(val) => assignStudentMutation.mutate(val)}>
                        <SelectTrigger className="bg-black/20 border-white/10 focus:ring-0 focus:border-indigo-500">
                            <SelectValue placeholder="Seleccionar estudiante..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                            {students.map((s: any) => (
                                <SelectItem key={s.id} value={s.id}>{s.username}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-zinc-600 pl-1">Selecciona para agregar acceso a este mundo.</p>
                </div>

                {/* Manage Levels Dialog */}
                <Dialog open={isManageLevelsOpen} onOpenChange={setIsManageLevelsOpen}>
                    <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Gestionar Niveles - {world.name}</DialogTitle>
                            <DialogDescription className="text-zinc-400">Agrega y administra el contenido de los niveles en este mundo.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Add New Content Form */}
                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                                <h4 className="font-semibold mb-4">Agregar Nuevo Contenido</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Nivel</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={newContent.level}
                                            onChange={(e) => setNewContent({ ...newContent, level: parseInt(e.target.value) || 1 })}
                                            className="bg-black/50 border-white/10 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Tipo</label>
                                        <Select
                                            value={newContent.type}
                                            onValueChange={(val) => setNewContent({ ...newContent, type: val })}
                                        >
                                            <SelectTrigger className="bg-black/50 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10">
                                                <SelectItem value="pdf">PDF</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="assignment">Tarea</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium text-zinc-300">Título</label>
                                    <Input
                                        value={newContent.title}
                                        onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                                        className="bg-black/50 border-white/10 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium text-zinc-300">Descripción</label>
                                    <Input
                                        value={newContent.description}
                                        onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                                        className="bg-black/50 border-white/10 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium text-zinc-300">URL del Archivo</label>
                                    <Input
                                        value={newContent.fileUrl}
                                        onChange={(e) => setNewContent({ ...newContent, fileUrl: e.target.value })}
                                        className="bg-black/50 border-white/10 focus:border-indigo-500"
                                    />
                                </div>
                                <Button
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500"
                                    onClick={() => createContentMutation.mutate(newContent)}
                                    disabled={!newContent.title || !newContent.fileUrl}
                                >
                                    {createContentMutation.isPending ? "Creando..." : "Agregar Contenido"}
                                </Button>
                            </div>

                            {/* Existing Content List */}
                            <div className="space-y-4">
                                <h4 className="font-semibold">Contenido Existente</h4>
                                {Array.isArray(worldContent) && worldContent.length === 0 && (
                                    <p className="text-zinc-500 text-center py-8">No hay contenido creado aún.</p>
                                )}
                                {Array.isArray(worldContent) && worldContent.map((content: any) => (
                                    <div key={content.id} className="bg-zinc-900/30 p-4 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-medium">{content.title}</h5>
                                                <p className="text-sm text-zinc-400">{content.description}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        Nivel {content.level}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs capitalize">
                                                        {content.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
