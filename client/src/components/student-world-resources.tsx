import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    FileText,
    Video,
    ClipboardList,
    Download,
    Upload,
    X,
    CheckCircle2,
    Layers,
    ChevronRight,
    Rocket,
    Lock,
    Presentation,
    Code,
    Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StudentWorldResourcesProps {
    worldId: number;
    isOpen: boolean;
    onClose: () => void;
    worldName: string;
    selectedLevel?: number;
}

const LEVELS = Array.from({ length: 5 }, (_, i) => i + 1);

export function StudentWorldResources({ worldId, isOpen, onClose, worldName, selectedLevel }: StudentWorldResourcesProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [currentSelectedLevel, setSelectedLevel] = useState<number>(selectedLevel || 1);
    const [viewMode, setViewMode] = useState<"list" | "submit">("list");
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);

    // Update selected level when prop changes
    useEffect(() => {
        if (selectedLevel) {
            setSelectedLevel(selectedLevel);
        }
    }, [selectedLevel]);

    const currentMaxLevel = user?.currentLevelId || 1;

    // Queries
    const { data: content = [] } = useQuery({
        queryKey: [`/api/worlds/${worldId}/content`],
        queryFn: async () => {
            const res = await fetch(`/api/worlds/${worldId}/content`);
            if (!res.ok) throw new Error("Failed to fetch content");
            return res.json();
        }
    });

    const filteredContent = content.filter((c: any) => c.level === currentSelectedLevel);

    // Submit Mutation
    const submitMutation = useMutation({
        mutationFn: async () => {
            if (!submissionFile || !selectedAssignment) throw new Error("Missing file or assignment");

            // 1. Upload File
            const formData = new FormData();
            formData.append("file", submissionFile);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const { url } = await uploadRes.json();

            // 2. Submit
            const submitRes = await fetch(`/api/content/${selectedAssignment.id}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: url })
            });

            if (!submitRes.ok) throw new Error("Failed to submit");
            return submitRes.json();
        },
        onSuccess: () => {
            toast({ title: "Tarea entregada con éxito" });
            setSubmissionFile(null);
            setSelectedAssignment(null);
            setViewMode("list");
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleOpenSubmit = (assignment: any) => {
        setSelectedAssignment(assignment);
        setViewMode("submit");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-black/95 border-none text-white max-w-[95vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden shadow-2xl shadow-cyan-900/20">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 my-auto">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                                MISIÓN: <span className="text-cyan-400">{worldName.toUpperCase()}</span>
                            </h2>
                            <p className="text-xs text-zinc-400 font-mono">TU NIVEL ACTUAL: <span className="text-white font-bold">{currentMaxLevel}</span></p>
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
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Niveles de Acceso</h3>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {LEVELS.map((level) => {
                                    const isLocked = level > currentMaxLevel;
                                    return (
                                        <button
                                            key={level}
                                            onClick={() => !isLocked && setSelectedLevel(level)}
                                            disabled={isLocked}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200",
                                                selectedLevel === level
                                                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/20"
                                                    : isLocked
                                                        ? "text-zinc-600 bg-black/20 cursor-not-allowed opacity-50"
                                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded flex items-center justify-center text-xs font-bold border",
                                                selectedLevel === level ? "border-transparent bg-white/20" :
                                                    isLocked ? "border-zinc-800 bg-zinc-900 text-zinc-600" : "border-zinc-700 bg-zinc-800"
                                            )}>
                                                {isLocked ? <Lock className="w-3 h-3" /> : level}
                                            </div>
                                            <span>Nivel {level}</span>
                                            {selectedLevel === level && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                                            {isLocked && <Lock className="w-3 h-3 ml-auto opacity-30" />}
                                        </button>
                                    );
                                })}
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
                                <Layers className="w-5 h-5 text-cyan-400" />
                                <span className="font-bold text-lg">Recursos del Nivel {selectedLevel}</span>
                                <Badge variant="secondary" className="ml-2 bg-white/10 text-zinc-300 border-0">
                                    {filteredContent.length} Items
                                </Badge>
                            </div>
                            {viewMode === "submit" && (
                                <Button
                                    variant="outline"
                                    onClick={() => setViewMode("list")}
                                    className="gap-2 border-white/10 bg-black/50 hover:bg-white/10"
                                >
                                    <ClipboardList className="w-4 h-4" /> Volver a Lista
                                </Button>
                            )}
                        </div>

                        {/* Content Views */}
                        <div className="flex-1 overflow-hidden p-8 relative z-0">
                            {viewMode === "list" ? (
                                <ScrollArea className="h-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                                        {filteredContent.length === 0 && (
                                            <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                                                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                                                    <ClipboardList className="w-8 h-8 text-zinc-600" />
                                                </div>
                                                <h4 className="text-xl font-bold text-zinc-400">Sin Datos</h4>
                                                <p className="text-zinc-500 mt-2 max-w-sm text-center">No hay recursos disponibles para este nivel aún.</p>
                                            </div>
                                        )}
                                        {filteredContent.map((item: any) => (
                                            <Card key={item.id} className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border-white/10 hover:border-cyan-400/50 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-cyan-500/10 relative">
                                                {/* TV Screen Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none" />
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <CardContent className="p-6 relative">
                                                    {/* Content Type Badge */}
                                                    <div className="absolute top-4 right-4">
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
                                                    <div className="flex items-start gap-4 mb-6">
                                                        <div className={cn(
                                                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-2",
                                                            item.type === 'pdf' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10' :
                                                            item.type === 'video' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/10' :
                                                            item.type === 'presentation' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10' :
                                                            item.type === 'assignment' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10' :
                                                            item.type === 'code' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-purple-500/10' :
                                                            'bg-pink-500/10 text-pink-500 border-pink-500/20 shadow-pink-500/10'
                                                        )}>
                                                            {item.type === 'pdf' ? <FileText className="w-8 h-8" /> :
                                                             item.type === 'video' ? <Video className="w-8 h-8" /> :
                                                             item.type === 'presentation' ? <Presentation className="w-8 h-8" /> :
                                                             item.type === 'assignment' ? <ClipboardList className="w-8 h-8" /> :
                                                             item.type === 'code' ? <Code className="w-8 h-8" /> :
                                                             <Image className="w-8 h-8" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-black text-xl leading-tight text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                                                                {item.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                                <span>Publicado {new Date(item.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <div className="mb-6">
                                                        <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed">
                                                            {item.description || "Sin descripción disponible."}
                                                        </p>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:text-cyan-200 transition-all duration-300 shadow-lg"
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
                                                        {item.type === 'assignment' && (
                                                            <Button
                                                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-105"
                                                                onClick={() => handleOpenSubmit(item)}
                                                            >
                                                                <Upload className="w-4 h-4 mr-2" />
                                                                Entregar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>

                                                {/* Bottom TV Effect */}
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="max-w-4xl mx-auto w-full">
                                    <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 border-cyan-400/20 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                                        {/* TV Screen Border Effect */}
                                        <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-2xl pointer-events-none" />
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-t-2xl" />

                                        <CardContent className="p-8 space-y-8 relative">
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                                                    <Upload className="w-10 h-10 text-white" />
                                                </div>
                                                <h3 className="text-3xl font-black text-white mb-2">Centro de Entregas</h3>
                                                <p className="text-zinc-400 text-lg">Subiendo tu solución para <span className="text-emerald-400 font-bold">"{selectedAssignment?.title}"</span></p>
                                            </div>

                                            {/* Assignment Details */}
                                            <div className="bg-gradient-to-r from-black/40 to-zinc-900/40 p-6 rounded-2xl border border-white/10">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                                        <ClipboardList className="w-6 h-6 text-emerald-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white mb-2">{selectedAssignment?.title}</h4>
                                                        <p className="text-sm text-zinc-300 leading-relaxed">{selectedAssignment?.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* File Upload Area */}
                                            <div className="space-y-4">
                                                <label className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    <Upload className="w-5 h-5" />
                                                    Tu Archivo de Entrega
                                                </label>
                                                <div className="relative">
                                                    <div className={cn(
                                                        "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer",
                                                        submissionFile
                                                            ? "border-emerald-400/50 bg-emerald-500/5"
                                                            : "border-white/20 bg-black/30 hover:border-emerald-400/30 hover:bg-emerald-500/5"
                                                    )}>
                                                        <input
                                                            type="file"
                                                            onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png"
                                                        />
                                                        {submissionFile ? (
                                                            <div className="space-y-4">
                                                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-lg font-bold text-white">{submissionFile.name}</p>
                                                                    <p className="text-sm text-zinc-400">
                                                                        {(submissionFile.size / 1024 / 1024).toFixed(2)} MB • {submissionFile.type || 'Archivo'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto">
                                                                    <Upload className="w-8 h-8 text-zinc-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-lg font-bold text-white">Arrastra tu archivo aquí</p>
                                                                    <p className="text-sm text-zinc-400">o haz clic para seleccionar</p>
                                                                    <p className="text-xs text-zinc-500 mt-2">
                                                                        Formatos: PDF, DOC, ZIP, JPG, PNG • Máx 50MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
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
                                                    className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-105"
                                                    onClick={() => submitMutation.mutate()}
                                                    disabled={!submissionFile || submitMutation.isPending}
                                                >
                                                    {submitMutation.isPending ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                            Subiendo...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                                            Enviar Entrega
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
