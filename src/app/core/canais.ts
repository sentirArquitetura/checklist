/** Um canal sensorial avaliado pelo checklist. */
export interface Canal {
  readonly id: string;
  /** Nome curto do canal — usado como marcador no diagnóstico. */
  readonly nome: string;
  /** Pergunta apresentada ao visitante. */
  readonly pergunta: string;
  /** Cor do canal no mapa sensorial. */
  readonly cor: string;
}

/**
 * Os dez sinais do checklist, organizados pelos canais sensoriais
 * que a Neuroarquitetura usa para ler um ambiente de trabalho.
 *
 * As cores saem da família pastel do logotipo: o coral e a menta da marca
 * são dois dos dez canais, e os outros oito acompanham a mesma saturação.
 */
export const CANAIS: readonly Canal[] = [
  {
    id: 'luz',
    nome: 'Luz',
    pergunta:
      'A iluminação causa desconforto visual, reflexo nas telas ou deixa áreas mal iluminadas?',
    cor: '#F2B441',
  },
  {
    id: 'cor',
    nome: 'Cor',
    pergunta:
      'As cores do escritório tornam o ambiente cansativo ou pouco agradável ao longo do dia?',
    cor: '#E58BA8',
  },
  {
    id: 'materia',
    nome: 'Matéria',
    pergunta:
      'Móveis, revestimentos ou acabamentos estão desgastados ou já não atendem à operação?',
    cor: '#C98A5E',
  },
  {
    id: 'som',
    nome: 'Som',
    pergunta: 'Conversas, telefones ou reuniões atrapalham a concentração da equipe?',
    cor: '#7FA8D4',
  },
  {
    id: 'ar',
    nome: 'Ar',
    pergunta: 'Há reclamações frequentes de calor, frio ou má circulação de ar?',
    cor: '#89C4C4',
  },
  {
    id: 'biofilia',
    nome: 'Biofilia',
    pergunta: 'O escritório tem pouca vegetação, luz natural ou elementos naturais?',
    cor: '#6FA97F',
  },
  {
    id: 'identidade',
    nome: 'Identidade',
    pergunta: 'O ambiente não comunica a identidade, os valores ou a cultura da empresa?',
    cor: '#F59494',
  },
  {
    id: 'fluxo',
    nome: 'Fluxo',
    pergunta: 'O layout dificulta a colaboração entre times ou o fluxo das atividades?',
    cor: '#8A8CBA',
  },
  {
    id: 'pausa',
    nome: 'Pausa',
    pergunta:
      'O espaço de pausas e refeições é pouco confortável ou não favorece a recuperação?',
    cor: '#E0A98F',
  },
  {
    id: 'aroma',
    nome: 'Aroma',
    pergunta: 'Existem odores desagradáveis ou falta uma identidade sensorial no ambiente?',
    cor: '#B58CC4',
  },
];
