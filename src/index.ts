import { registerServices, Joi } from '@sirensolutions/web-service-interface';
import ActaPublica from './ActaPublica';

// This is the syntax for registering the 'ActaPublica' service into the group 'investigative-acta-docs'
const  requiredConfig = { client_id: Joi.string().required(), client_secret: Joi.string().required() };

export = registerServices('investigative-acta-docs', [ActaPublica], requiredConfig);

