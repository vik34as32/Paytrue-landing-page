export interface BankOption {
  id: string;
  name: string;
  shortName: string;
  ifscPrefix: string;
  logo: string;
}

export interface BankApiInput {
  id?: string;
  name: string;
  shortName?: string;
  ifscPrefix?: string;
  ifsc?: string;
  logo?: string;
  operatorCode?: string;
  bankName?: string;
}
