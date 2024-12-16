import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class hemovitalisService {
  apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  enviarFormulario(dados: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/listagemPaciente', dados);
  }

  findAllPageable(page: number = 0, linesPerPage: number = 5, direction: string = 'ASC', orderBy: string = 'id'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('linesPerPage', linesPerPage.toString())
      .set('direction', direction)
      .set('orderBy', orderBy);

    return this.http.get<any>(`${this.apiUrl}/listagemPaciente/pageado`, {params});
  }

  deletarListagem(id: number): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/deletar/${id}`;
    return this.http.delete<any>(url);
  }

  dadosPaciente(id: number): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/listaDePacientes/${id}`;
    return this.http.get<any>(url);
  }

  findPopulacaoCadaEstado(id: number): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/estado/${id}`;
    return this.http.get<any>(url);
  }

  findPopulacaoPorEstado(id: number, estado: string): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/${id}/${estado}`;
    return this.http.get<any>(url);
  }

  imcFaixaEtaria(id: number): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/imc/${id}`;
    return this.http.get<any>(url);
  }

  obesidadeSexo(id: number): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/percentualObesidade/${id}`;
    return this.http.get<any>(url);
  }

  tipoSanguineoPorIdade(id: number): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/tipoSanguineoPorIdade/${id}`;
    return this.http.get<any>(url);
  }

  doadoresEreceptores(id: number): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/receptorEdoadores/${id}`;
    return this.http.get<any>(url);
  }

  doadoresEreceptoresPorTipoSanguineo(id: number, tipoSanguineo: string): Observable<any>{
    const url = `${this.apiUrl}/listagemPaciente/receptorEdoadores/${id}/${tipoSanguineo}`;
    return this.http.get<any>(url);
  }

  editarPaciente(paciente: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pacientes/${paciente.id}`, paciente);
  }

  deletarPaciente(id: number): Observable<any>{
    const url = `${this.apiUrl}/pacientes/deletar/${id}`;
    return this.http.delete<any>(url);
  }

}
