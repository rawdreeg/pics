import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, AfterViewInit {

  @ViewChild("fileInput", {static: false}) fileInput: ElementRef;
  @ViewChild("img", {static: false}) image: ElementRef;
  @ViewChild("dropBox", {static: false}) dropBox: ElementRef;
  @ViewChild("tagInput", {static: false}) tagInput: ElementRef;

  uploadForm: FormGroup;
  
  uploadFileError: string = null;
  tagsError: string = null;
  uploading: boolean = false; // Upload status

  constructor(private _auth: AuthService) { }

  ngOnInit() {
    this.uploadForm = new FormGroup({
      title: new FormControl(null),
      description: new FormControl(null),
      tags: new FormArray([]),
      image: new FormControl(null)
    });
  }
  
  ngAfterViewInit(){
    // File input change event
    this.fileInput.nativeElement.addEventListener("change", (e: any)=>{
      this.storeFileValue(this.fileInput.nativeElement.files[0]);
    });

    // DropBox events
    let box = this.dropBox.nativeElement;
    
    // Drop event
    box.addEventListener("drop", (e: any) =>{
      e.stopPropagation();
      e.preventDefault();
      
      this.storeFileValue(e.dataTransfer.files[0]);
    })
    // Drag over the element event
    box.addEventListener("dragover", (e: any) =>{
      e.stopPropagation();
      e.preventDefault();
      
      e.dataTransfer.dropEffect = "copy";
    })

  }



  /**
   * Click to the upload box event
   */
  boxClicked(){
    this.fileInput.nativeElement.click();
  }



  /**
   * Show the image
   * Store file object to the image input
   * @param file 
   */
  storeFileValue(file: File){
    
    // Create url of the file
    let url = URL.createObjectURL(file);
    this.image.nativeElement.src = url;
  
    // Store the file on "image" input
    this.uploadForm.get("image").setValue(file);
  }

  /**
   * Add tag when user write space
   */
  tagValueChanges(){
    
    // Get input value
    let value = this.tagInput.nativeElement.value;

    if(value[value.length - 1] != ' ') return;

    // Remove spacing
    value = value.trim();
    let tags = value.split(' ');

    if((<FormArray>this.uploadForm.get("tags")).length >= 5 && tags.length){
      this.tagInput.nativeElement.value = "";
      this.tagsError = "Can't add more that 5 tags";
      return;
    }
    this.tagsError = "";




    
    (<FormArray>this.uploadForm.get("tags")).push(new FormControl(tags[0]));

    this.tagInput.nativeElement.value = "";
  }

  /**
   * Remove tag from the tags array
   * @param i 
   */
  removeTag(i: number){
    this.tagsError = "";
    (<FormArray>this.uploadForm.get("tags")).removeAt(i);
  }

  /**
   * Upload the image to the server
   */
  uploadImage(){
    let fd = new FormData();
    let values = this.uploadForm.value;

    fd.append("title", values.title);
    fd.append("description", values.description);
    fd.append("image", values.image);
    for(let i = 0; i < values.tags.length; i++){
      fd.append("tags[" + i + "]", values.tags[i]);
    }
    
    this._auth.uploadImage(fd).subscribe(
      console.log,
      console.error
    );
  }  

}
