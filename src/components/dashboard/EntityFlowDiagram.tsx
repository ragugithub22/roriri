import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EntityFlowDiagram = () => {
  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="text-lg">Integration Architecture</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Central Hub */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-xl opacity-30 rounded-full"></div>
              <div className="relative bg-gradient-primary text-white px-8 py-6 rounded-2xl shadow-strong">
                <div className="text-center">
                  <p className="font-bold text-xl">RORIRI ERP Core</p>
                  <p className="text-sm opacity-90 mt-1">Shared Infrastructure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Entity Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: "Academy", color: "from-blue-500 to-cyan-500", connections: ["Foundation", "IT"] },
              { name: "Foundation", color: "from-pink-500 to-rose-500", connections: ["Farm", "Academy"] },
              { name: "Farm", color: "from-green-500 to-emerald-500", connections: ["Trading", "Automation"] },
              { name: "Consultancy", color: "from-purple-500 to-violet-500", connections: ["All Units"] },
              { name: "Trading", color: "from-orange-500 to-amber-500", connections: ["Farm", "Automation"] },
              { name: "Automation", color: "from-slate-500 to-zinc-500", connections: ["Trading", "IT"] },
              { name: "IT Company", color: "from-indigo-500 to-blue-500", connections: ["All Units"] },
            ].map((entity, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`bg-gradient-to-br ${entity.color} text-white px-4 py-3 rounded-lg shadow-soft text-center min-w-[120px]`}>
                  <p className="font-semibold text-sm">{entity.name}</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {entity.connections.map((conn, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0.5">
                      {conn}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Data Flow Indicators */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">Data Sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Process Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-muted-foreground">Resource Allocation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-muted-foreground">Analytics Pipeline</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntityFlowDiagram;
