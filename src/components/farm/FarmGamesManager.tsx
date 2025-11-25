import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, Edit, Trash2, Gamepad2, Clock, Users, DollarSign, Star } from "lucide-react";
import { toast } from "sonner";

interface FarmGame {
  id: string;
  game_code: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  capacity: number;
  age_limit: number;
  category: string;
  status: string;
  created_at: string;
}

const FarmGamesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<FarmGame | null>(null);
  const [formData, setFormData] = useState({
    game_code: "",
    name: "",
    description: "",
    duration_minutes: "",
    price: "",
    capacity: "",
    age_limit: "",
    category: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["farm-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_games" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FarmGame[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("farm_games" as any)
        .insert([{
          ...data,
          duration_minutes: parseInt(data.duration_minutes),
          price: parseFloat(data.price),
          capacity: parseInt(data.capacity),
          age_limit: parseInt(data.age_limit)
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-games"] });
      toast.success("Game created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create game: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("farm_games" as any)
        .update({
          ...data,
          duration_minutes: parseInt(data.duration_minutes),
          price: parseFloat(data.price),
          capacity: parseInt(data.capacity),
          age_limit: parseInt(data.age_limit)
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-games"] });
      toast.success("Game updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update game: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("farm_games" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-games"] });
      toast.success("Game deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete game: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      game_code: "",
      name: "",
      description: "",
      duration_minutes: "",
      price: "",
      capacity: "",
      age_limit: "",
      category: "",
      status: "active"
    });
    setEditingGame(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGame) {
      updateMutation.mutate({ id: editingGame.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (game: FarmGame) => {
    setEditingGame(game);
    setFormData({
      game_code: game.game_code,
      name: game.name,
      description: game.description || "",
      duration_minutes: game.duration_minutes.toString(),
      price: game.price.toString(),
      capacity: game.capacity.toString(),
      age_limit: game.age_limit.toString(),
      category: game.category,
      status: game.status
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: "game_code", label: "Game Code" },
    { key: "name", label: "Name" },
    {
      key: "category",
      label: "Category",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: "duration_minutes",
      label: "Duration",
      render: (value: number) => `${value} min`
    },
    {
      key: "price",
      label: "Price",
      render: (value: number) => `₹${value}`
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (value: number) => value || "Unlimited"
    },
    {
      key: "age_limit",
      label: "Age Limit",
      render: (value: number) => `${value}+ years`
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === "active" ? "default" :
          value === "inactive" ? "secondary" :
          "destructive"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: FarmGame) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this game?")) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const activeGames = games.filter(g => g.status === "active");
  const totalRevenue = games.reduce((sum, g) => sum + g.price, 0);
  const totalCapacity = games.reduce((sum, g) => sum + g.capacity, 0);

  const categories = [...new Set(games.map(g => g.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Games & Activities Management</h2>
          <p className="text-muted-foreground">Manage farm games, activities, and entertainment options</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGame ? "Edit Game" : "Add New Game"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="game_code">Game Code *</Label>
                  <Input
                    id="game_code"
                    value={formData.game_code}
                    onChange={(e) => setFormData({ ...formData, game_code: e.target.value })}
                    required
                    placeholder="GM001"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Game Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Riding">Riding</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Games">Games</SelectItem>
                      <SelectItem value="Animal">Animal</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="age_limit">Age Limit *</Label>
                  <Input
                    id="age_limit"
                    type="number"
                    min="0"
                    value={formData.age_limit}
                    onChange={(e) => setFormData({ ...formData, age_limit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingGame ? "Update" : "Create"} Game
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{games.length}</div>
            <p className="text-xs text-muted-foreground">All activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGames.length}</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">People per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">From all games</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Games & Activities"
        description="Manage all farm games and entertainment activities"
        columns={columns}
        data={games}
        emptyMessage="No games found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default FarmGamesManager;
