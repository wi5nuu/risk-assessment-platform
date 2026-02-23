"use client"

import React, { useState, useMemo } from 'react'
import { Risk, RiskWithDetails, RiskLevel, RiskStatus } from '@/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  Eye,
  FileEdit
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { getRiskLevelBadgeClass } from '@/lib/risk-engine'

interface RiskRegisterProps {
  risks: RiskWithDetails[]
  onViewRisk?: (risk: RiskWithDetails) => void
  onEditRisk?: (risk: RiskWithDetails) => void
  className?: string
}

type SortColumn = keyof RiskWithDetails
type SortDirection = 'asc' | 'desc'

interface SortState {
  column: SortColumn
  direction: SortDirection
}

export function RiskRegister({ 
  risks, 
  onViewRisk, 
  onEditRisk,
  className 
}: RiskRegisterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<RiskStatus | 'all'>('all')
  const [sort, setSort] = useState<SortState>({ column: 'risk_score', direction: 'desc' })
  
  // Filter and sort risks
  const filteredRisks = useMemo(() => {
    let result = [...risks]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(risk =>
        risk.risk_title.toLowerCase().includes(term) ||
        risk.assetName.toLowerCase().includes(term) ||
        risk.threatActor?.toLowerCase().includes(term) ||
        risk.owner?.toLowerCase().includes(term)
      )
    }
    
    // Apply level filter
    if (filterLevel !== 'all') {
      result = result.filter(risk => risk.risk_level === filterLevel)
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(risk => risk.status === filterStatus)
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sort.column]
      const bVal = b[sort.column]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      }
      
      return sort.direction === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number)
    })
    
    return result
  }, [risks, searchTerm, filterLevel, filterStatus, sort])
  
  const handleSort = (column: SortColumn) => {
    setSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }
  
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sort.column !== column) return null
    return sort.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" /> 
      : <ChevronDown className="w-4 h-4" />
  }
  
  const SortableHeader = ({ 
    column, 
    children,
    className
  }: { 
    column: SortColumn
    children: React.ReactNode
    className?: string
  }) => (
    <TableHead 
      className={cn("cursor-pointer hover:bg-muted/50", className)}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon column={column} />
      </div>
    </TableHead>
  )
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search risks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v as RiskLevel | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as RiskStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="identified">Identified</SelectItem>
              <SelectItem value="analyzed">Analyzed</SelectItem>
              <SelectItem value="mitigating">Mitigating</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="avoided">Avoided</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredRisks.length} of {risks.length} risks
      </div>
      
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="risk_title" className="w-[200px]">Risk</SortableHeader>
              <SortableHeader column="assetName">Asset</SortableHeader>
              <SortableHeader column="threatActor">Threat Actor</SortableHeader>
              <SortableHeader column="risk_score" className="text-center">Score</SortableHeader>
              <TableHead className="text-center">Level</TableHead>
              <SortableHeader column="status">Status</SortableHeader>
              <SortableHeader column="owner">Owner</SortableHeader>
              <SortableHeader column="review_date">Review Date</SortableHeader>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRisks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No risks found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] truncate" title={risk.risk_title}>
                      {risk.risk_title}
                    </div>
                  </TableCell>
                  <TableCell>{risk.assetName}</TableCell>
                  <TableCell>{risk.threatActor || 'N/A'}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {risk.risk_score}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={risk.risk_level}
                      className="capitalize"
                    >
                      {risk.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{risk.status}</span>
                  </TableCell>
                  <TableCell>{risk.owner || 'Unassigned'}</TableCell>
                  <TableCell>{formatDate(risk.review_date)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onViewRisk && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewRisk(risk)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onEditRisk && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditRisk(risk)}
                        >
                          <FileEdit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
