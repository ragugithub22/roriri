import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Search, Calendar } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const Attendance = () => {
  const [searchEmployee, setSearchEmployee] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Get IT company entity ID
  const { data: itCompanyEntity } = useQuery({
    queryKey: ["it-company-entity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_company")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case "today":
        return {
          from: format(startOfDay(now), "yyyy-MM-dd"),
          to: format(endOfDay(now), "yyyy-MM-dd"),
        };
      case "week":
        return {
          from: format(startOfWeek(now), "yyyy-MM-dd"),
          to: format(endOfWeek(now), "yyyy-MM-dd"),
        };
      case "month":
        return {
          from: format(startOfMonth(now), "yyyy-MM-dd"),
          to: format(endOfMonth(now), "yyyy-MM-dd"),
        };
      default:
        return null;
    }
  };

  // Fetch attendance records
  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ["it-company-attendance", itCompanyEntity?.id, dateFilter, searchEmployee],
    queryFn: async () => {
      if (!itCompanyEntity?.id) return [];

      let query = supabase
        .from("attendance")
        .select(`
          *,
          employees!inner (
            id,
            employee_code,
            entity_id,
            profiles:profile_id (
              full_name,
              email
            )
          )
        `)
        .eq("employees.entity_id", itCompanyEntity.id)
        .order("date", { ascending: false });

      // Apply date range filter
      const dateRange = getDateRange();
      if (dateRange) {
        query = query.gte("date", dateRange.from).lte("date", dateRange.to);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by employee name on the frontend
      let filteredData = data || [];
      if (searchEmployee) {
        filteredData = filteredData.filter((record: any) =>
          record.employees?.profiles?.full_name
            ?.toLowerCase()
            .includes(searchEmployee.toLowerCase())
        );
      }

      return filteredData;
    },
    enabled: !!itCompanyEntity?.id,
  });

  const getStatusBadge = (checkIn: string | null, checkOut: string | null) => {
    if (checkIn && checkOut) {
      return (
        <Badge variant="default" className="bg-green-500">
          Present
        </Badge>
      );
    } else if (checkIn) {
      return (
        <Badge variant="secondary" className="bg-yellow-500">
          Incomplete
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          Absent
        </Badge>
      );
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "hh:mm a");
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMM yyyy");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          RORIRI IT Company Attendance
        </CardTitle>
        <CardDescription>
          Track and manage employee attendance records for RORIRI Software Solution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee name..."
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading attendance records...
          </div>
        ) : !attendanceRecords || attendanceRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attendance records found.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S. No</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>In Time</TableHead>
                  <TableHead>Out Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record: any, index: number) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {record.employees?.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{formatTime(record.check_in)}</TableCell>
                    <TableCell>{formatTime(record.check_out)}</TableCell>
                    <TableCell>
                      {getStatusBadge(record.check_in, record.check_out)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Attendance;
