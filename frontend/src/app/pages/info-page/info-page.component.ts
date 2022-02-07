import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface IServerData {
  data: string;
}

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.scss']
})

export class InfoPageComponent implements OnInit {
  serverData: { data: string };

  constructor(
    private readonly http: HttpClient
  ) { }

  ngOnInit() {
    this.http.get(`http://localhost:8080/api/main/resource`)
    .subscribe((data: IServerData) => {
      this.serverData = data;
      console.log(this.serverData);
    });
  }
}
