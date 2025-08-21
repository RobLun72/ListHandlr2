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
      id: 1,
    },
    {
      index: 1,
      text: "Viltfärsbiffar m ugnspotatis o sås",
      done: false,
      link: "",
      id: 2,
    },
    {
      index: 2,
      text: "Mary me chicken med ris",
      done: false,
      link: "",
      id: 3,
    },
    {
      index: 3,
      text: "Wallenbergare m mos och sås",
      done: false,
      link: "",
      id: 4,
    },
    {
      index: 4,
      text: "Bolonges m pasta",
      done: false,
      link: "",
      id: 5,
    },
    {
      index: 5,
      text: "Lunch: Korv m bröd",
      done: true,
      link: "",
      id: 6,
    },
    {
      index: 6,
      text: "Lunch: Våfflor m varmrökt lax och vaniljvisp o blåbär",
      done: true,
      link: "",
      id: 7,
    },
    {
      index: 7,
      text: "Lunch: Skagentårta",
      done: true,
      link: "",
      id: 8,
    },
    {
      index: 8,
      text: "Lunch: Kycklingben med grekisk sallad",
      done: true,
      link: "",
      id: 9,
    },
    {
      index: 9,
      text: "Fiskpinnar och potatismos",
      done: true,
      link: "",
      id: 10,
    },
    {
      index: 10,
      text: "Bakad sötpotatis med fetaostkräm och chilistekta svarta bönor",
      done: true,
      link: "",
      id: 11,
    },
    {
      index: 11,
      text: "Torskputanesca m pasta",
      done: true,
      link: "",
      id: 12,
    },
    {
      index: 12,
      text: "Lammstek, potatisgratäng o tzatziki",
      done: true,
      link: "",
      id: 13,
    },
    {
      index: 13,
      text: "Varm kronisdipp m kex Palek paneer m naan o raita Pricessglass Påskäggsgodis",
      done: true,
      link: "",
      id: 14,
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
      id: 15,
    },
    {
      index: 1,
      text: "Tesil",
      done: false,
      link: "",
      id: 16,
    },
    {
      index: 2,
      text: "Tomat",
      done: false,
      link: "",
      id: 17,
    },
    {
      index: 3,
      text: "Gurka",
      done: false,
      link: "",
      id: 18,
    },
    {
      index: 4,
      text: "Jos",
      done: false,
      link: "",
      id: 19,
    },
    {
      index: 5,
      text: "Yoggi",
      done: false,
      link: "",
      id: 20,
    },
    {
      index: 6,
      text: "Mjölk ",
      done: false,
      link: "",
      id: 21,
    },
    {
      index: 7,
      text: "Läsk",
      done: false,
      link: "",
      id: 22,
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
      id: 23,
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
