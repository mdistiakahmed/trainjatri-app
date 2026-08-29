// Import all train data statically for React Native
import { trainData as aghnibina_express } from '../data/train/aghnibina_express.js';
import { trainData as banalata_express } from '../data/train/banalata_express.js';
import { trainData as banglabandha_express } from '../data/train/banglabandha_express.js';
import { trainData as barendra_express } from '../data/train/barendra_express.js';
import { trainData as benapole_express } from '../data/train/benapole_express.js';
import { trainData as bhrammaputra_express } from '../data/train/bhrammaputra_express.js';
import { trainData as bijoy_express } from '../data/train/bijoy_express.js';
import { trainData as burimari_commuter } from '../data/train/burimari_commuter.js';
import { trainData as burimari_express } from '../data/train/burimari_express.js';
import { trainData as chapainawabganj_shuttle } from '../data/train/chapainawabganj_shuttle.js';
import { trainData as chattala_express } from '../data/train/chattala_express.js';
import { trainData as chattogram_mail } from '../data/train/chattogram_mail.js';
import { trainData as chilahati_express } from '../data/train/chilahati_express.js';
import { trainData as chitra_express } from '../data/train/chitra_express.js';
import { trainData as coxs_bazar_express } from '../data/train/coxs_bazar_express.js';
import { trainData as dhaka_mail } from '../data/train/dhaka_mail.js';
import { trainData as dhalarchar_express } from '../data/train/dhalarchar_express.js';
import { trainData as dhumketu_express } from '../data/train/dhumketu_express.js';
import { trainData as dolonchapa_express } from '../data/train/dolonchapa_express.js';
import { trainData as drutojan_express } from '../data/train/drutojan_express.js';
import { trainData as egarosindhur_godhuli } from '../data/train/egarosindhur_godhuli.js';
import { trainData as egarosindhur_provati } from '../data/train/egarosindhur_provati.js';
import { trainData as ekota_express } from '../data/train/ekota_express.js';
import { trainData as hawr_express } from '../data/train/hawr_express.js';
import { trainData as jahanabad_express } from '../data/train/jahanabad_express.js';
import { trainData as jamalpur_express } from '../data/train/jamalpur_express.js';
import { trainData as jamuna_express } from '../data/train/jamuna_express.js';
import { trainData as jayentika_express } from '../data/train/jayentika_express.js';
import { trainData as kalni_express } from '../data/train/kalni_express.js';
import { trainData as kanchon_intercity_commuter } from '../data/train/kanchon_intercity_commuter.js';
import { trainData as kapotaksha_express } from '../data/train/kapotaksha_express.js';
import { trainData as karnaphuli_commuter } from '../data/train/karnaphuli_commuter.js';
import { trainData as kishorganj_express } from '../data/train/kishorganj_express.js';
import { trainData as korotoa_express } from '../data/train/korotoa_express.js';
import { trainData as kurigram_express } from '../data/train/kurigram_express.js';
import { trainData as lalmoni_commuter } from '../data/train/lalmoni_commuter.js';
import { trainData as lalmoni_express } from '../data/train/lalmoni_express.js';
import { trainData as madhumati_express } from '../data/train/madhumati_express.js';
import { trainData as mahanagar_godhuli } from '../data/train/mahanagar_godhuli.js';
import { trainData as mahanagar_provati } from '../data/train/mahanagar_provati.js';
import { trainData as meghna_express } from '../data/train/meghna_express.js';
import { trainData as mohanagar_express } from '../data/train/mohanagar_express.js';
import { trainData as mohonganj_express } from '../data/train/mohonganj_express.js';
import { trainData as nilsagar_express } from '../data/train/nilsagar_express.js';
import { trainData as noakhali_mail } from '../data/train/noakhali_mail.js';
import { trainData as padma_express } from '../data/train/padma_express.js';
import { trainData as paharika_express } from '../data/train/paharika_express.js';
import { trainData as panchagarh_express } from '../data/train/panchagarh_express.js';
import { trainData as parabat_express } from '../data/train/parabat_express.js';
import { trainData as parjotak_express } from '../data/train/parjotak_express.js';
import { trainData as probal_express } from '../data/train/probal_express.js';
import { trainData as rangpur_express } from '../data/train/rangpur_express.js';
import { trainData as ruposhi_bangla_express } from '../data/train/ruposhi_bangla_express.js';
import { trainData as rupsha_express } from '../data/train/rupsha_express.js';
import { trainData as sagardari_express } from '../data/train/sagardari_express.js';
import { trainData as shaikat_express } from '../data/train/shaikat_express.js';
import { trainData as silkcity_express } from '../data/train/silkcity_express.js';
import { trainData as simanta_express } from '../data/train/simanta_express.js';
import { trainData as sirajganj_express } from '../data/train/sirajganj_express.js';
import { trainData as sonar_bangla_express } from '../data/train/sonar_bangla_express.js';
import { trainData as suborno_express } from '../data/train/suborno_express.js';
import { trainData as sundarban_express } from '../data/train/sundarban_express.js';
import { trainData as surma_mail } from '../data/train/surma_mail.js';
import { trainData as tista_express } from '../data/train/tista_express.js';
import { trainData as titas_commuter } from '../data/train/titas_commuter.js';
import { trainData as titumir_express } from '../data/train/titumir_express.js';
import { trainData as tungipara_express } from '../data/train/tungipara_express.js';
import { trainData as turna } from '../data/train/turna.js';
import { trainData as udayan_express } from '../data/train/udayan_express.js';
import { trainData as upaban_express } from '../data/train/upaban_express.js';
import { trainData as upakul_express } from '../data/train/upakul_express.js';

// Create a map of all train data
const trainDataMap: Record<string, any> = {
  aghnibina_express,
  banalata_express,
  banglabandha_express,
  barendra_express,
  benapole_express,
  bhrammaputra_express,
  bijoy_express,
  burimari_commuter,
  burimari_express,
  chapainawabganj_shuttle,
  chattala_express,
  chattogram_mail,
  chilahati_express,
  chitra_express,
  coxs_bazar_express,
  dhaka_mail,
  dhalarchar_express,
  dhumketu_express,
  dolonchapa_express,
  drutojan_express,
  egarosindhur_godhuli,
  egarosindhur_provati,
  ekota_express,
  hawr_express,
  jahanabad_express,
  jamalpur_express,
  jamuna_express,
  jayentika_express,
  kalni_express,
  kanchon_intercity_commuter,
  kapotaksha_express,
  karnaphuli_commuter,
  kishorganj_express,
  korotoa_express,
  kurigram_express,
  lalmoni_commuter,
  lalmoni_express,
  madhumati_express,
  mahanagar_godhuli,
  mahanagar_provati,
  meghna_express,
  mohanagar_express,
  mohonganj_express,
  nilsagar_express,
  noakhali_mail,
  padma_express,
  paharika_express,
  panchagarh_express,
  parabat_express,
  parjotak_express,
  probal_express,
  rangpur_express,
  ruposhi_bangla_express,
  rupsha_express,
  sagardari_express,
  shaikat_express,
  silkcity_express,
  simanta_express,
  sirajganj_express,
  sonar_bangla_express,
  suborno_express,
  sundarban_express,
  surma_mail,
  tista_express,
  titas_commuter,
  titumir_express,
  tungipara_express,
  turna,
  udayan_express,
  upaban_express,
  upakul_express,
};

export const getDataForTrain = async (name: string) => {
  try {
    if (!name) {
      throw new Error(`No data file found for param: ${name}`);
    }

    const fileName = name.replace(/-/g, "_");
    const data = trainDataMap[fileName];

    if (!data) {
      throw new Error(`Train data not found for: ${fileName}`);
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
