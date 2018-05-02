import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import typeAheadFr from './modules/typeAhead_fr';
import makeMap from './modules/map';
import makeMapFr from './modules/map_fre';
import ajaxHeart from './modules/heart';

autocomplete( $('#address'), $('#lat'), $('#lng') );

typeAhead( $('.search') );

typeAheadFr( $('.searchfr') );

makeMap( $('#map') );

makeMapFr( $('#mapfr') );

 // $$ means Document.querySelector('.heart'). i.e  any form with a class of heart - each of our heart icon in store is a form
 const heartForms = $$('form.heart');
 // on, signals the event listener ie, on submit, submit being e, the a call back function to run
 // So when form is submited, call ajaxHeart
 heartForms.on('submit', ajaxHeart);


 