import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'swg-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css'],
})
export class GeneratorComponent implements OnInit {

  generatorForm: FormGroup;

  backends: string[] = [ 'Javascript', 'Java', 'Kotlin', 'php' ];
  themes: string[] = [ 'indigo-pink', 'deeppurple-amber', 'pink-bluegrey', 'purple-green', 'custom-light', 'custom-dark' ];

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.generatorForm = this.formBuilder.group({
      name: ['hello-world', Validators.required],
      title: ['Hello World', Validators.required],
      author:  ['', Validators.required],
      mail:  [''],
      description: ['An example app.', Validators.required],
      theme: [this.themes[0], Validators.required],
      buildDir: ['dist', Validators.required],
      ghUser: [''],
      language: ['en', Validators.required],
      prefix:  ['hw', Validators.required],
      useDocker: [false],
      useMITLicense: [true],
      useMock: [false],
      useSecurity: [false],
      modRewriteIndex: [false],
      useGoogleFonts: [true],
      installDependencies: [true],
      useYarn: ['yarn'],
      backend: [this.backends[0]],
      groupId: ['org.example.hello_world'],
      management: ['maven'],
      modRewritePhpExtension: [true],
      serverAsApi: [true],
    });
  }

  checkBackend(backends: string[]): boolean {
    return backends.includes(this.generatorForm.value.backend);
  }
}
