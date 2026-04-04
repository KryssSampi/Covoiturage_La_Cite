/* FAQ Item Model — Covoiturage La Cité */

export interface FAQQuestion {
  question: string;
  reponse:  string;
}

export class FAQItemModel {
  id:        string        = '';
  sujet:     string        = '';
  categorie: string        = '';
  items:     FAQQuestion[] = [];

  constructor(data?: Partial<FAQItemModel>) {
    if (data) Object.assign(this, data);
  }
}
