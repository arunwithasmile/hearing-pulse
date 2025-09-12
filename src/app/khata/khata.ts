import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-khata',
  imports: [CurrencyPipe],
  templateUrl: './khata.html',
  styleUrl: './khata.css'
})
export class Khata {
  transactions = [
    {
      id: 1,
      date: '2024-07-20',
      description: 'Initial investment',
      type: 'credit',
      amount: 50000
    },
    {
      id: 2,
      date: '2024-07-21',
      description: 'Purchase of raw materials',
      type: 'debit',
      amount: 15000
    },
    {
      id: 3,
      date: '2024-07-22',
      description: 'Sale of goods (Invoice #123)',
      type: 'credit',
      amount: 25000
    },
    {
      id: 4,
      date: '2024-07-22',
      description: 'Electricity bill payment',
      type: 'debit',
      amount: 2500
    },
    {
      id: 5,
      date: '2024-07-23',
      description: 'Received payment from Client A',
      type: 'credit',
      amount: 10000
    },
    {
      id: 6,
      date: '2024-07-24',
      description: 'Rent payment',
      type: 'debit',
      amount: 7000
    },
    {
      id: 7,
      date: '2024-07-25',
      description: 'Sale of goods (Invoice #124)',
      type: 'credit',
      amount: 18000
    },
    {
      id: 8,
      date: '2024-07-26',
      description: 'Internet bill',
      type: 'debit',
      amount: 1200
    },
    {
      id: 9,
      date: '2024-07-27',
      description: 'Purchase of office supplies',
      type: 'debit',
      amount: 800
    },
    {
      id: 10,
      date: '2024-07-28',
      description: 'Sale of goods (Invoice #125)',
      type: 'credit',
      amount: 32000
    }]

}
