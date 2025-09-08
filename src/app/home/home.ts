import { Component } from '@angular/core';
import { Avatar } from '../components/avatar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [Avatar, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected readonly calls = [
    {
      fullName: 'Arjun Sharma',
      place: 'Mumbai',
      dateTime: '2024-07-20 10:00 AM',
      duration: '10m 23s'
    },
    {
      fullName: 'Priya Patel',
      place: 'Delhi',
      dateTime: '2024-07-20 02:30 PM',
      duration: '5m 12s'
    },
    {
      fullName: 'Rohan Mehta',
      place: 'Bengaluru',
      dateTime: '2024-07-21 09:00 AM',
      duration: '12m 45s'
    },
    {
      fullName: 'Ananya Rao',
      place: 'Hyderabad',
      dateTime: '2024-07-21 11:45 AM',
      duration: '8m 30s'
    },
    {
      fullName: 'Vikram Singh',
      place: 'Chennai',
      dateTime: '2024-07-21 03:15 PM',
      duration: '15m 00s'
    },
    {
      fullName: 'Isha Gupta',
      place: 'Pune',
      dateTime: '2024-07-22 08:30 AM',
      duration: '7m 50s'
    }
  ];
}
