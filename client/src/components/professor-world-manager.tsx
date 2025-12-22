import React, { useState } from "react";
import {
    FileText,
    Video,
    Upload,
    Plus,
    Layout,
    ClipboardList,
    Download,
    Trash2,
    X,
    Layers,
    CheckCircle2,
    ChevronRight,
    Monitor,
    FileVideo,
    FileImage,
    FileAudio,
    Link,
    BookOpen,
    Presentation,
    Code,
    Image,
    Film,
    FileSpreadsheet,
    File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfessorWorldManagerProps {
    worldId: number;
    isOpen: boolean;
    onClose: () => void;
    worldName: string;
}

const CONTENT_TYPES = [
    {
        id: 'pdf',
        name: 'Documento PDF',
        description: 'Archivos PDF, documentos de texto',
        icon: FileText,
        color: 'bg-red-500/10 text-red-500 border-red-500/20',
        accept: '.pdf'
    },
    {
        id: 'video',
        name: 'Video',
        description: 'Videos MP4, MOV, AVI',
        icon: Film,
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        accept: '.mp4,.mov,.avi,.mkv'
    },
    {
        id: 'presentation',
        name: 'Presentación',
        description: 'PowerPoint, Keynote, PDFs de slides',
        icon: Presentation,
        color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        accept: '.ppt,.pptx,.key,.pdf'
    },
    {
        id: 'assignment',
        name: 'Tarea/Actividad',
        description: 'Ejercicios, proyectos, entregables',
        icon: ClipboardList,
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        accept: '.pdf,.doc,.docx,.zip'
    },
    {
        id: 'code',
        name: 'Código/Programa',
        description: 'Archivos de código, proyectos',
        icon: Code,
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        accept: '.zip,.rar,.py,.js,.html,.css'
    },
    {
        id: 'image',
        name: 'Imagen/Diagrama',
        description: 'Imágenes, diagramas, infografías',
        icon: Image,
        color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        accept: '.jpg,.jpeg,.png,.gif,.svg'
    }
];

export function ProfessorWorldManager({ worldId, isOpen, onClose, worldName }: ProfessorWorldManagerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedLevel, setSelectedLevel] = useState<number>(1);
    const [viewMode, setViewMode] = useState<"list" | "upload">("list");

    // Form State
    const [newContent, setNewContent] = useState({
        title: "",
        description: "",
        type: "pdf", // pdf, video, assignment
        file: null as File | null
    });

    // Queries
    const { data: content = [] } = useQuery({
        queryKey: [`/api/worlds/${worldId}/content`],
        queryFn: async () => {
            const res = await fetch(`/api/worlds/${worldId}/content`);
            if (!res.ok) throw new Error("Failed to fetch content");
            return res.json();
        }
    });

    const filteredContent = content.filter((c: any) => c.level === selectedLevel);

    // Upload Mutation
    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!newContent.file) throw new Error("No file selected");

            // 1. Upload File
            const formData = new FormData();
            formData.append("file", newContent.file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const { url } = await uploadRes.json();

            // 2. Create Content Entry
            const contentRes = await fetch(`/api/worlds/${worldId}/content`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newContent.title,
                    description: newContent.description,
                    type: newContent.type,
                    fileUrl: url,
                    level: selectedLevel
                })
            });

            if (!contentRes.ok) throw new Error("Failed to create content");
            return contentRes.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/worlds/${worldId}/content`] });
            setViewMode("list");
            setNewContent({ title: "", description: "", type: "pdf", file: null });
            toast({ title: "Contenido publicado exitosamente" });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-black/95 border-none text-white max-w-[95vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden shadow-2xl shadow-cyan-900/20">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 my-auto">
                            <Layout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                                GESTIÓN DE MUNDO: <span className="text-cyan-400">{worldName.toUpperCase()}</span>
                            </h2>
                            <p className="text-xs text-zinc-400 font-mono">PANEL DE CONTROL PROFESOR v2.0</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-white/10" onClick={onClose}>
                        <X className="w-6 h-6 text-zinc-400" />
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Level Selector */}
                    <div className="w-64 bg-zinc-900/50 border-r border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Niveles del Sector</h3>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {LEVELS.map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200",
                                            selectedLevel === level
                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                                : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded flex items-center justify-center text-xs font-bold border",
                                            selectedLevel === level ? "border-transparent bg-white/20" : "border-zinc-700 bg-zinc-800"
                                        )}>
                                            {level}
                                        </div>
                                        <span>Nivel {level}</span>
                                        {selectedLevel === level && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col bg-black/40 relative">
                        {/* Background Grid Decoration */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                        {/* Toolbar */}
                        <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-white/5 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-indigo-400" />
                                <span className="font-bold text-lg">Contenido del Nivel {selectedLevel}</span>
                                <Badge variant="secondary" className="ml-2 bg-white/10 text-zinc-300 border-0">
                                    {filteredContent.length} Recursos
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === "list" ? "default" : "secondary"}
                                    onClick={() => setViewMode("list")}
                                    className={cn("gap-2", viewMode === "list" ? "bg-zinc-800" : "bg-transparent hover:bg-white/5")}
                                >
                                    <ClipboardList className="w-4 h-4" /> Ver Lista
                                </Button>
                                <Button
                                    variant={viewMode === "upload" ? "default" : "secondary"} // Actually use a highlight color for primary action
                                    onClick={() => setViewMode("upload")}
                                    className={cn(
                                        "gap-2 transition-all",
                                        viewMode === "upload"
                                            ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                                            : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30"
                                    )}
                                >
                                    <Plus className="w-4 h-4" /> Subir Contenido
                                </Button>
                            </div>
                        </div>

                        {/* Content Views */}
                        <div className="flex-1 overflow-hidden p-8 relative z-0">
                            {viewMode === "list" ? (
                                <ScrollArea className="h-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                                        {filteredContent.length === 0 && (
                                            <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                                                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                                                    <Upload className="w-8 h-8 text-zinc-600" />
                                                </div>
                                                <h4 className="text-xl font-bold text-zinc-400">Zona Vacía</h4>
                                                <p className="text-zinc-500 mt-2 max-w-sm text-center">No has publicado contenido para el Nivel {selectedLevel} todavía.</p>
                                                <Button
                                                    variant="link"
                                                    className="text-indigo-400 mt-4"
                                                    onClick={() => setViewMode("upload")}
                                                >
                                                    Comenzar a subir recursos
                                                </Button>
                                            </div>
                                        )}
                                        {filteredContent.map((item: any) => (
                                            <Card key={item.id} className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border-white/10 hover:border-indigo-400/50 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-indigo-500/10 relative">
                                                {/* TV Screen Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none" />
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                {/* Delete Button */}
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full"
                                                        onClick={() => {
                                                            // TODO: Implement delete functionality
                                                            console.log('Delete content:', item.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <CardContent className="p-6 relative">
                                                    {/* Content Type Badge */}
                                                    <div className="absolute top-4 left-4">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-xs uppercase tracking-wider border-0 shadow-lg",
                                                                item.type === 'pdf' ? 'bg-red-500/20 text-red-400' :
                                                                item.type === 'video' ? 'bg-blue-500/20 text-blue-400' :
                                                                item.type === 'presentation' ? 'bg-orange-500/20 text-orange-400' :
                                                                item.type === 'assignment' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                item.type === 'code' ? 'bg-purple-500/20 text-purple-400' :
                                                                'bg-pink-500/20 text-pink-400'
                                                            )}
                                                        >
                                                            {item.type === 'pdf' ? '📄 PDF' :
                                                             item.type === 'video' ? '🎥 VIDEO' :
                                                             item.type === 'presentation' ? '📊 PRESENTACIÓN' :
                                                             item.type === 'assignment' ? '📝 TAREA' :
                                                             item.type === 'code' ? '💻 CÓDIGO' :
                                                             '🖼️ IMAGEN'}
                                                        </Badge>
                                                    </div>

                                                    {/* Content Icon & Title */}
                                                    <div className="flex items-start gap-4 mb-6 pt-8">
                                                        <div className={cn(
                                                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-2",
                                                            item.type === 'pdf' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10' :
                                                            item.type === 'video' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/10' :
                                                            item.type === 'presentation' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10' :
                                                            item.type === 'assignment' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10' :
                                                            item.type === 'code' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-purple-500/10' :
                                                            'bg-pink-500/10 text-pink-500 border-pink-500/20 shadow-pink-500/10'
                                                        )}>
                                                            {CONTENT_TYPES.find(t => t.id === item.type)?.icon ?
                                                                React.createElement(CONTENT_TYPES.find(t => t.id === item.type)!.icon, { className: "w-8 h-8" }) :
                                                                <FileText className="w-8 h-8" />
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-black text-xl leading-tight text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                                                                {item.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                                <span>Publicado {new Date(item.createdAt).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span>Nivel {item.level}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <div className="mb-6">
                                                        <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed">
                                                            {item.description || "Sin descripción disponible."}
                                                        </p>
                                                    </div>

                                                    {/* Action Button */}
                                                    <Button
                                                        variant="outline"
                                                        className="w-full border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/50 hover:text-indigo-200 transition-all duration-300 shadow-lg"
                                                        asChild
                                                    >
                                                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <Download className="w-4 h-4 mr-2" />
                                                            {item.type === 'video' ? 'Ver Video' :
                                                             item.type === 'pdf' ? 'Ver Documento' :
                                                             item.type === 'presentation' ? 'Ver Presentación' :
                                                             item.type === 'code' ? 'Ver Código' :
                                                             item.type === 'assignment' ? 'Ver Tarea' :
                                                             'Ver Recurso'}
                                                        </a>
                                                    </Button>
                                                </CardContent>

                                                {/* Bottom TV Effect */}
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <ScrollArea className="h-full">
                                    <div className="max-w-4xl mx-auto w-full pb-20">
                                        <div className="space-y-8">
                                            {/* Header */}
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
                                                    <Monitor className="w-10 h-10 text-white" />
                                                </div>
                                                <h3 className="text-3xl font-black text-white mb-2">Centro de Contenidos</h3>
                                                <p className="text-zinc-400 text-lg">Publicando recursos para <span className="text-indigo-400 font-bold">Nivel {selectedLevel}</span></p>
                                            </div>

                                            {/* Content Type Selection */}
                                            <div className="space-y-4">
                                                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5" />
                                                    Tipo de Contenido
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {CONTENT_TYPES.map((type) => {
                                                        const Icon = type.icon;
                                                        const isSelected = newContent.type === type.id;
                                                        return (
                                                            <button
                                                                key={type.id}
                                                                onClick={() => setNewContent({ ...newContent, type: type.id })}
                                                                className={cn(
                                                                    "p-6 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-105",
                                                                    isSelected
                                                                        ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20"
                                                                        : "border-white/10 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-800/50"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                                                                    isSelected ? "bg-indigo-500 text-white" : type.color
                                                                )}>
                                                                    <Icon className="w-6 h-6" />
                                                                </div>
                                                                <h5 className="font-bold text-white mb-1">{type.name}</h5>
                                                                <p className="text-sm text-zinc-400">{type.description}</p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Content Details Form */}
                                            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border-white/10 backdrop-blur-xl shadow-2xl">
                                                <CardHeader>
                                                    <CardTitle className="text-xl text-white flex items-center gap-2">
                                                        <FileText className="w-5 h-5" />
                                                        Detalles del Contenido
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        <div className="space-y-2 lg:col-span-2">
                                                            <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                                                <BookOpen className="w-4 h-4" />
                                                                Título del Recurso
                                                            </label>
                                                            <Input
                                                                value={newContent.title}
                                                                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                                                                className="bg-black/50 border-white/10 h-12 text-lg focus:border-indigo-500/50 transition-colors"
                                                                placeholder="Ej: Introducción a la Robótica Cuántica"
                                                            />
                                                        </div>

                                                        <div className="space-y-2 lg:col-span-2">
                                                            <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                                                <FileText className="w-4 h-4" />
                                                                Descripción e Instrucciones
                                                            </label>
                                                            <Textarea
                                                                value={newContent.description}
                                                                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                                                                className="bg-black/50 border-white/10 min-h-[120px] focus:border-indigo-500/50 transition-colors resize-none"
                                                                placeholder="Describe el contenido, objetivos de aprendizaje, instrucciones específicas..."
                                                            />
                                                        </div>

                                                        {/* File Upload Area */}
                                                        <div className="space-y-2 lg:col-span-2">
                                                            <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                                                <Upload className="w-4 h-4" />
                                                                Archivo del Recurso
                                                            </label>
                                                            <div className="relative">
                                                                <div className={cn(
                                                                    "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300",
                                                                    newContent.file
                                                                        ? "border-indigo-500/50 bg-indigo-500/5"
                                                                        : "border-white/20 bg-black/30 hover:border-white/30 hover:bg-black/50"
                                                                )}>
                                                                    <input
                                                                        type="file"
                                                                        onChange={(e) => setNewContent({ ...newContent, file: e.target.files?.[0] || null })}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                        accept={CONTENT_TYPES.find(t => t.id === newContent.type)?.accept}
                                                                    />
                                                                    {newContent.file ? (
                                                                        <div className="space-y-4">
                                                                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
                                                                                <CheckCircle2 className="w-8 h-8 text-indigo-400" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-lg font-bold text-white">{newContent.file.name}</p>
                                                                                <p className="text-sm text-zinc-400">
                                                                                    {(newContent.file.size / 1024 / 1024).toFixed(2)} MB
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-4">
                                                                            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto">
                                                                                <Upload className="w-8 h-8 text-zinc-400" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-lg font-bold text-white">Arrastra y suelta tu archivo aquí</p>
                                                                                <p className="text-sm text-zinc-400">o haz clic para seleccionar</p>
                                                                                <p className="text-xs text-zinc-500 mt-2">
                                                                                    Formatos soportados: {CONTENT_TYPES.find(t => t.id === newContent.type)?.accept || "Todos"}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="pt-6 flex gap-4">
                                                        <Button
                                                            variant="secondary"
                                                            className="flex-1 h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10"
                                                            onClick={() => setViewMode("list")}
                                                        >
                                                            <X className="w-5 h-5 mr-2" />
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20"
                                                            onClick={() => uploadMutation.mutate()}
                                                            disabled={!newContent.title || !newContent.file || uploadMutation.isPending}
                                                        >
                                                            {uploadMutation.isPending ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                                    Subiendo...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                                                    Publicar Contenido
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

