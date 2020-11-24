import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios from 'axios';
import * as moment from 'moment';

export default class ActaPublica extends ServiceDefinition<{ client_id: string, client_secret: string }> {
  // This is the name the service is given in the UI
  readonly name = 'actapublica';

  // These are the inputs that the user sees in the UI
  readonly inputSchema: InputSchema = {
    shortSSN: {
      type: 'text',
      description: 'SSN in short format for the person you are looking for documents on',
      required: true
    }
  };

  // This is what the data that this driver returns looks like, split by index suffix.
  // For example, this configuration stores objects into the index web-service-investigative-acta-docs-actapublica-results-item
  readonly outputConfiguration: OutputConfiguration = {
    document: {
      date: 'date',
      filename: 'keyword',
      doctype: 'keyword',
      ssn_short: 'keyword',
      orgnr_short: 'keyword'
    }
  };

  // Called to invoke the service. The inputs argument will have fields described in this.inputSchema
  async invoke(inputs): Promise<DataIndexResults> {
    // The API endpoint to send a query to
    const url = 'https://api.arkivet.actapublica.se/';

    const params = {
      query: "",
      personnummer: {
        condition: "AND",
        values: [
            inputs.shortSSN
        ]
      },
      start_date: '1-1-1900 00:00:00',
      end_date: '1-1-2900 00:00:00',
      size: 10000
    };

    const authentication = {
      'grant_type': 'client_credentials',
      'client_id': this.config.client_id,
      'client_secret': this.config.client_secret,
      'scope': 'agent.detail,agent.list,document.download,document.list,document.view'
    }

    const res = await axios.post(url + 'authorize', authentication )
        .catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));

    //console.log(res.data.access_token);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + res.data.access_token
    };

    // The axios library is used here, but you can use a different library/implementation for querying an API
    const response = await axios.post(url + 'search', params, { headers: headers })
      .catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));

    // Must return objects with the same structure as in this.outputConfiguration. These are stored in Elasticsearch automatically.
    return {
      document: response.data.hits.map(item => ({
        filename: item.filename,
        date: item.datum,
        doctype: item.doctype,
        ssn_short: item.personnummer,
        orgnr_short: item.organisationsnummer
      }))
    };
  }
}
