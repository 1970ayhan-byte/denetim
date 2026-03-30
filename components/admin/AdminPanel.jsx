'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardTab } from '@/components/admin/tabs/DashboardTab'
import { CategoriesTab } from '@/components/admin/tabs/CategoriesTab'
import { QuestionsTab } from '@/components/admin/tabs/QuestionsTab'
import { StaffTab } from '@/components/admin/tabs/StaffTab'
import { PackagesTab } from '@/components/admin/tabs/PackagesTab'
import { CitiesTab } from '@/components/admin/tabs/CitiesTab'
import { MessagesTab } from '@/components/admin/tabs/MessagesTab'
import { PaymentsTab } from '@/components/admin/tabs/PaymentsTab'
import { NewsManagementTab } from '@/components/admin/tabs/NewsManagementTab'
import { InspectionAssignmentTab } from '@/components/admin/tabs/InspectionAssignmentTab'
import { InspectionsTab } from '@/components/admin/tabs/InspectionsTab'

export function AdminPanel({ token }) {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Paneli</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-11 mb-6">
            <TabsTrigger value="dashboard">📊 Raporlama</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="questions">Sorular</TabsTrigger>
            <TabsTrigger value="staff">Personel</TabsTrigger>
            <TabsTrigger value="packages">Paketler</TabsTrigger>
            <TabsTrigger value="cities">İller</TabsTrigger>
            <TabsTrigger value="messages">Mesajlar</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="inspections">Denetimler</TabsTrigger>
            <TabsTrigger value="news">Haberler</TabsTrigger>
            <TabsTrigger value="assign">Atama</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <DashboardTab token={token} />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab token={token} />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionsTab token={token} />
          </TabsContent>
          <TabsContent value="staff">
            <StaffTab token={token} />
          </TabsContent>
          <TabsContent value="packages">
            <PackagesTab token={token} />
          </TabsContent>
          <TabsContent value="cities">
            <CitiesTab token={token} />
          </TabsContent>
          <TabsContent value="messages">
            <MessagesTab token={token} />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab token={token} />
          </TabsContent>
          <TabsContent value="inspections">
            <InspectionsTab token={token} />
          </TabsContent>
          <TabsContent value="news">
            <NewsManagementTab token={token} />
          </TabsContent>
          <TabsContent value="assign">
            <InspectionAssignmentTab token={token} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
