import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { LogregService } from '../services/logreg.service';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements AfterViewInit,OnDestroy{

  showWarning:boolean;
  tokenForm:FormGroup;

  private register:boolean;
  private login:boolean;
  private counter:number;
  private subscription:Subscription;
  remaining:string;

  constructor(private fb:FormBuilder, private route:ActivatedRoute, private router:Router, private logreg:LogregService){
    this.showWarning = false;
    this.tokenForm = this.fb.group({
      token:['',Validators.required]
    })


    this.counter = 180;
    this.remaining = '03:00';
    this.subscription = new Subscription();
    this.register = false;
    this.login = false;

  }

  ngOnInit():void{

    this.route.queryParams.subscribe(params=>{

      if(params['register']){
        this.register = params['register'];
      }else if(params['login']){
        this.login = params['login'];
      }

    })

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.startCounter();
  }

  private startCounter():void{
    const obs = interval(1000);
    this.subscription = obs.subscribe((n:number)=>{
      const min:string = Math.floor(Number((this.counter - n)/60)) < 10?'0'+Math.floor(Number((this.counter - n)/60)).toString()+':':Math.floor(Number((this.counter - n)/60)).toString()+':';
      const seg:string = Math.floor(Number((this.counter - n)%60)) < 10?'0'+Math.floor(Number((this.counter - n)%60)).toString():Math.floor(Number((this.counter - n)%60)).toString();
      this.remaining = min + seg;

      if(this.remaining === '00:00'){

        this.subscription.unsubscribe();
        this.router.navigate(['']);

      }
    })
  }

  sendToken():void{
    if(this.tokenForm.invalid){
      this.showWarning = true;
      return;
    }

    if(this.register){

      this.logreg.register(this.tokenForm).subscribe(result=>{

        if(result){
          this.subscription.unsubscribe();
          this.router.navigate(['']);
        }
      })

    }else if(this.login){
      this.logreg.login(this.tokenForm).subscribe(res=>{
        if(res){
          this.router.navigate(['/profile']);
        }
      })
    }


  }

}
