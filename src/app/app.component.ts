
import { CommonModule } from '@angular/common';
import { Component,ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { hemovitalisService } from './hemovitalis.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  nome: string = '';
  dataInclusao: string = '';
  jsonInput: string = '';
  pacienteDTOList: any[] = [];
  chart: any;
  listaPacienteDTO: any;
  listaEstado: any
  totalPages: any;
  currentPage: any;
  idLista: any;
  listaImc: any;
  percentualObesidadeSexo: any;
  tipoSanguineoPorIdade: any;
  doadoresEreceptoresList: any;
  pacienteList: any;
  pacienteForm: FormGroup;
  idListaPaciente: any;

  constructor(private hemovitalisService: hemovitalisService, private fb: FormBuilder) {
    this.pacienteForm = this.fb.group({
      id: [''],
      nome: [''],
      cpf: [''],
      rg: [''],
      data_nasc: [''],
      sexo: [''],
      mae: [''],
      pai: [''],
      email: [''],
      cep: [''],
      endereco: [''],
      numero: [''],
      bairro: [''],
      cidade: [''],
      estado: [''],
      telefone_fixo: [''],
      celular: [''],
      altura: [''],
      peso: [''],
      tipo_sanguineo: [''],
      imc: [{ value: '', disabled: true }]
    });
  }

  enviarDados() {
    const pacienteDTOList = JSON.parse(this.jsonInput)
    const dadosFormulario = {
      nome: this.nome,
      dataInclusao: this.dataInclusao,
      pacienteDTOList: pacienteDTOList
    };
    this.hemovitalisService.enviarFormulario(dadosFormulario).subscribe({
      next: (response) => {
        this.limparCampos();
        alert('Dados enviados e salvos com  sucesso!');
      },
      error: (error) => {
        alert('Erro ao enviar os dados!');
      }
    });
  }

  carregarLista() {
    this.carregarListasPacientes(0);
  }



  carregarListasPacientes(page: number = 0) {
    this.hemovitalisService.findAllPageable(page).subscribe({
      next: (response) => {
        this.listaPacienteDTO = response.content;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
      },
      error: (error) => {
        console.error('Erro ao carregar as listas de pacientes:', error);
      }
    });
  }

  mudarPagina(page: number) {
    this.carregarListasPacientes(page);
  }

  // Metodos responsavel pelo Modal Candidatos por Estado
  qtdPorEstado(id: any) {
    this.idLista = id;
    this.hemovitalisService.findPopulacaoCadaEstado(id).subscribe({
      next: (response) => {
        this.listaEstado = response;
        this.chartBarEstados(this.listaEstado);
      }, error: (error) => {
        console.error('Erro ao carregar os dados:', error);
      }
    })
  }

  chartBarEstados(data: any[]): void {
    Chart.register(...registerables);
    if (this.chart) {
      this.chart.destroy();
    }
    const labels = data.map(item => item.estado);
    const datasetData = data.map(item => item.quantidade);

    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Quantidade no Estado',
            data: datasetData,
            backgroundColor: [
              '#400428', '#b81c48', '#baafc4', '#c3062c', '#ffcc33', '#7f9473',
              '#400428', '#f4e196', '#d1c8a3', '#dea37a', '#5f9982', '#ffffe5',
              '#243a69', '#0aabba', '#00b5b9', '#3b8183', '#1c997f', '#b2d5ba',
              '#d4cdc5', '#5b88a5', '#fe8b05', '#dddd92', '#807462', '#c8e3c5',
              '#033649', '#eee9e5', '#033649', '#a3c68c'
            ],
            borderColor: '#FFFFFF',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem: any) {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw || 0;
                const total = data.reduce((sum, item) => sum + item.quantidade, 0);
                const percentage = ((value / total) * 100).toFixed(2) + '%';
                return `${label}: ${value} (${percentage})`;
              }
            }
          }
        }
      }
    });
  }

  selecionarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSelecionado = selectElement.value;
    if (estadoSelecionado === 'outros') {
      this.qtdPorEstado(this.idLista);
    } else {
      this.hemovitalisService.findPopulacaoPorEstado(this.idLista, estadoSelecionado).subscribe({
        next: (response) => {
          this.listaEstado = response;
          this.chartPieEstados(this.listaEstado);
        }, error: (error) => {
          console.error('Erro ao carregar os dados:', error);
        }
      })
    }
  }

  chartPieEstados(dataResponse: any): void {
    Chart.register(...registerables);
    if (this.chart) {
      this.chart.destroy();
    }
    const porcentagemAmostra = (dataResponse.quantidade / dataResponse.totalDaAmostra) * 100;


    const labels = [dataResponse.estado];
    const data = [dataResponse.quantidade, dataResponse.totalDaAmostra - dataResponse.quantidade];
    const total = dataResponse.totalDaAmostra;

    this.chart = new Chart('canvas', {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Quantidade de Pacientes em ' + dataResponse.estado + ' (' + porcentagemAmostra.toFixed(2) + '%)',
            data: data,
            backgroundColor: ['#003e4f', '#8eaf93'],
            borderColor: '#FFF',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let label = context.label || '';
                const value = context.raw;
                const percentageLabel = (value / total * 100).toFixed(2) + '%';
                label += ': ' + value + ' (' + percentageLabel + ')';
                return label;
              }
            }
          }
        }
      }
    });
  }

  // Metodos responsavel pelo modal IMC por Faixa Etaria
  imcPorFaixaEtaria(id: any) {
    this.hemovitalisService.imcFaixaEtaria(id).subscribe({
      next: (response) => {
        this.listaImc = response;
        this.chartBarImc(this.listaImc);
      }, error: (error) => {
        console.error('Erro ao carregar os dados:', error);
      }
    })
  }

  chartBarImc(dataResponse: any[]): void {
    Chart.register(...registerables);
    if (this.chart) {
      this.chart.destroy();
    }
    const labels = dataResponse.map((item: any) => item.faixaEtaria);
    const data = dataResponse.map((item: any) => item.imc);

    this.chart = new Chart('canvasImc', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'IMC (Índice de Massa Corporal) Médio',
            data: data,
            backgroundColor: [
              '#400428', '#b81c48', '#baafc4', '#c3062c', '#ffcc33', '#7f9473',
              '#400428', '#f4e196', '#d1c8a3', '#dea37a'],
            borderColor: '#FFFFFF',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Faixa Etária'
            }
          },
          y: {
            title: {
              display: true,
              text: 'IMC'
            },
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  // Métodos responsavel pelo modal obesidade por sexo
  obesidadePorSexo(id: any) {
    this.hemovitalisService.obesidadeSexo(id).subscribe({
      next: (response) => {
        this.obesidadePorSexo = response;
        this.chartBarObesidade(this.obesidadePorSexo);
      }, error: (error) => {
        console.error('Erro ao carregar os dados:', error);
      }
    })
  }

  chartBarObesidade(dataResponse: any) {

    Chart.register(...registerables);

    const labels = ['Homens', 'Mulheres'];
    const data = [dataResponse.percentualHomens, dataResponse.percentualMulheres];

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('canvasObesidade', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Percentual de Obesos (%)',
            data: data,
            backgroundColor: ['#42A5F5', '#ff1964'],
            borderColor: ['#1E88E5', '#e8608c'],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Sexo'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Percentual de Obesidade (%)'
            },
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 10
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });

  }

  //Metodos responsaveis pelo modal Tipo Sanguineo Por Idade
  tipoSanguineoIdade(id: any) {
    this.hemovitalisService.tipoSanguineoPorIdade(id).subscribe({
      next: (response) => {
        this.tipoSanguineoPorIdade = response;
        this.chartBarTipoSanguineo(this.tipoSanguineoPorIdade);
      }, error: (error) => {
        console.error('Erro ao carregar os dados:', error);
      }
    })
  }

  chartBarTipoSanguineo(dadosResponse: any[]) {
    Chart.register(...registerables);

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = dadosResponse.map((item: any) => item.tipoSanguineo);
    const data = dadosResponse.map((item: any) => item.mediaIdade);

    this.chart = new Chart('canvasTipoSanguineo', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Média de Idade por Tipo Sanguíneo',
            data: data,
            backgroundColor: '#992c4b',
            borderColor: '#ffff',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tipo Sanguíneo'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Média de Idade'
            },
            beginAtZero: true,
            ticks: {
              stepSize: 5
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  // Metodos responsaveis pelo Modal Doadores e Receptores
  doadoresEreceptores(id: any) {
    this.idLista = id;
    this.hemovitalisService.doadoresEreceptores(id).subscribe({
      next: (response) => {
        this.doadoresEreceptoresList = response;
        this.chartBarDoadoresEreceptores(this.doadoresEreceptoresList);
      }, error: (error) => {
        console.error('Erro ao carregar os dados:', error);
      }
    })
  }


  chartBarDoadoresEreceptores(dadosResponse: any[]) {
    Chart.register(...registerables);

    if (this.chart) {
      this.chart.destroy();
    }
    const labels = dadosResponse.map((item: any) => item.tipoSanguineo);
    const doadores = dadosResponse.map((item: any) => (item.doadores));
    const receptores = dadosResponse.map((item: any) => (item.receptores));

    this.chart = new Chart('canvasDoadoresEreceptores', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Quantidade de Doadores',
            data: doadores,
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            borderWidth: 1
          },
          {
            label: 'Quantidade de Receptores',
            data: receptores,
            backgroundColor: '#FF7043',
            borderColor: '#FF5722',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tipo Sanguíneo'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Quantidade'
            },
            beginAtZero: true,
            ticks: {
              stepSize: 10
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });

  }

  seletorTipoSanguineo(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const tipoSanguineo = selectElement.value;
    if (tipoSanguineo === 'outros') {
      this.doadoresEreceptores(this.idLista);
    } else {
      this.hemovitalisService.doadoresEreceptoresPorTipoSanguineo(this.idLista, tipoSanguineo).subscribe({
        next: (response) => {
          this.doadoresEreceptoresList = response;
          this.chartPiePorTipoSanguineo(this.doadoresEreceptoresList);
        }, error: (error) => {
          console.error('Erro ao carregar os dados:', error);
        }
      })
    }
  }

  chartPiePorTipoSanguineo(dadosResponse: any): void {

    Chart.register(...registerables);

    if (this.chart) {
      this.chart.destroy();
    }


    const tipoSanguineo = dadosResponse.tipoSanguineo;
    const doadores = dadosResponse.doadores;
    const receptores = dadosResponse.receptores;
    const total = dadosResponse.totalDaAmostra;


    const percentualDoadores = (doadores / total) * 100;
    const percentualReceptores = (receptores / total) * 100;
    const percentualRestante = 100 - (percentualDoadores + percentualReceptores);


    if (percentualRestante > 0) {
      this.chart = new Chart('canvasDoadoresEreceptores', {
        type: 'pie',
        data: {
          labels: ['Doadores', 'Receptores', 'Publico não Selecionado'],
          datasets: [{
            data: [percentualDoadores, percentualReceptores, percentualRestante],
            backgroundColor: ['#a43955', '#616382', '#bec3bc'],
            hoverBackgroundColor: ['#a43955', '#616382', '#d7dacf']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 20,
                font: {
                  size: 14
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  let label = context.label || '';
                  const value = context.raw;
                  const percentageLabel = (value).toFixed(2) + '%';
                  label += ': ' + percentageLabel;
                  return label;
                }
              }
            }
          }
        }
      });
    } else {
      this.chart = new Chart('canvasDoadoresEreceptores', {
        type: 'pie',
        data: {
          labels: ['Doadores', 'Receptores'],
          datasets: [{
            data: [percentualDoadores, percentualReceptores],
            backgroundColor: ['#a43955', '#616382'],
            hoverBackgroundColor: ['#a43955', '#616382']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 20,
                font: {
                  size: 14
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  let label = context.label || '';
                  const value = context.raw;
                  const percentageLabel = (value).toFixed(2) + '%';
                  label += ': ' + percentageLabel;
                  return label;
                }
              }
            }
          }
        }
      });
    }
  }

  //Metodo responsavel por limpar os campos quando é preenchido um formulario
  limparCampos() {
    this.nome = '';
    this.dataInclusao = '';
    this.jsonInput = '';
  }

  // Metodo responsavel por deletar uma listagem inserida no banco de dados
  deletarLista(id: any) {
    this.hemovitalisService.deletarListagem(id).subscribe({
      next: (response) => {
        alert('Listagem de paciente deletada com Sucesso');
        this.carregarLista();
      },
      error: (error) => {
        console.error('Erro ao deletar a lista', error);
      }
    });
  }

  //Metodo responsavel por trazer dados de paciente de uma lista
  dadosPacientes(id: any) {
    debugger;
    if (id !== null) {
      this.idListaPaciente = id;
    }
    this.hemovitalisService.dadosPaciente(this.idListaPaciente).subscribe({
      next: (response) => {
        this.pacienteList = response;
      },
      error: (error) => {
        console.error('Falha ao obter lista de paciente', error);
      }
    });
  }

  //Metodos responsaveis pela edição de um paciente

  carregarPaciente(data: any) {
    this.pacienteForm.setValue({
      id: data.id,
      nome: data.nome,
      cpf: data.cpf,
      rg: data.rg,
      data_nasc: data.data_nasc,
      sexo: data.sexo,
      mae: data.mae,
      pai: data.pai,
      email: data.email,
      cep: data.cep,
      endereco: data.endereco,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      telefone_fixo: data.telefone_fixo,
      celular: data.celular,
      altura: data.altura,
      peso: data.peso,
      tipo_sanguineo: data.tipo_sanguineo,
      imc: data.imc
    });
  }


  atualizarDados() {
    if (this.pacienteForm.valid) {
      this.hemovitalisService.editarPaciente(this.pacienteForm.value).subscribe({
        next: (response) => {
          alert('Dados atualizados de ' + response.nome + " atualizados com sucesso");
          this.dadosPacientes(null);
        },
        error: (error) => {
          console.error('Erro ao atualizar dados do paciente ' + this.pacienteForm.value.nome , error);
        }
      });
    }
  }

  deletarPaciente(id: number) {
    this.hemovitalisService.deletarPaciente(id).subscribe({
      next: (response) => {
        this.dadosPacientes(null);
        alert('Paciente deletado com Sucesso');
      },
      error: (error) => {
        console.error('Erro ao deletar paciente', error);
      }
    });
  }
}
