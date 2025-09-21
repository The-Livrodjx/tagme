import { Routes } from '@angular/router';
import { ItemsTableComponent } from './features/items/components/item-table/item-table.component';
import { ItemCreateComponent } from './features/items/components/item-create/item-create.component';
import { ItemEditComponent } from './features/items/components/item-edit/item-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: '/items', pathMatch: 'full' },
  {
    path: 'items',
    component: ItemsTableComponent
  },
  {
    path: 'items/create',
    component: ItemCreateComponent
  },
  {
    path: 'items/:id/edit',
    component: ItemEditComponent
  },
  { path: '**', redirectTo: '/items' }
];
