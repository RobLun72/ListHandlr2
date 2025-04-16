import { ApiData } from "../../DTO/apiData";
import { NamedListData } from "../../DTO/oneListData";

export const matLista: ApiData<NamedListData> = {
  timeStamp: "2024-04-01T15:28:52.230Z",
  rows: [
    {
      index: 0,
      text: "Köttbullar, potatis med brunsås",
      done: false,
      link: "",
    },
    {
      index: 1,
      text: "Viltfärsbiffar m ugnspotatis o sås",
      done: false,
      link: "",
    },
    {
      index: 2,
      text: "Mary me chicken med ris",
      done: false,
      link: "",
    },
    {
      index: 3,
      text: "Wallenbergare m mos och sås",
      done: false,
      link: "",
    },
    {
      index: 4,
      text: "Bolonges m pasta",
      done: false,
      link: "",
    },
    {
      index: 5,
      text: "Lunch: Korv m bröd",
      done: true,
      link: "",
    },
    {
      index: 6,
      text: "Lunch: Våfflor m varmrökt lax och vaniljvisp o blåbär",
      done: true,
      link: "",
    },
    {
      index: 7,
      text: "Lunch: Skagentårta",
      done: true,
      link: "",
    },
    {
      index: 8,
      text: "Lunch: Kycklingben med grekisk sallad",
      done: true,
      link: "",
    },
    {
      index: 9,
      text: "Fiskpinnar och potatismos",
      done: true,
      link: "",
    },
    {
      index: 10,
      text: "Bakad sötpotatis med fetaostkräm och chilistekta svarta bönor",
      done: true,
      link: "",
    },
    {
      index: 11,
      text: "Torskputanesca m pasta",
      done: true,
      link: "",
    },
    {
      index: 12,
      text: "Lammstek, potatisgratäng o tzatziki",
      done: true,
      link: "",
    },
    {
      index: 13,
      text: "Varm kronisdipp m kex Palek paneer m naan o raita Pricessglass Påskäggsgodis",
      done: true,
      link: "",
    },
  ],
};

export const handlaLista: ApiData<NamedListData> = {
  timeStamp: "2024-04-05T15:35:41.823Z",
  rows: [
    {
      index: 0,
      text: "Ris",
      done: false,
      link: "",
    },
    {
      index: 1,
      text: "Tesil",
      done: false,
      link: "",
    },
    {
      index: 2,
      text: "Tomat",
      done: false,
      link: "",
    },
    {
      index: 3,
      text: "Gurka",
      done: false,
      link: "",
    },
    {
      index: 4,
      text: "Jos",
      done: false,
      link: "",
    },
    {
      index: 5,
      text: "Yoggi",
      done: false,
      link: "",
    },
    {
      index: 6,
      text: "Mjölk ",
      done: false,
      link: "",
    },
    {
      index: 7,
      text: "Läsk",
      done: false,
      link: "",
    },
  ],
};

export const testyLista: ApiData<NamedListData> = {
  timeStamp: "2024-04-03T12:56:11.563Z",
  rows: [
    {
      index: 0,
      text: "item1",
      done: false,
      link: "",
    },
  ],
};

export interface MockedNamedList {
  name: string;
  data: ApiData<NamedListData>;
}

export const allNamedLists: MockedNamedList[] = [
  { name: "Matlista", data: matLista },
  { name: "Handla", data: handlaLista },
  { name: "testy", data: testyLista },
];
