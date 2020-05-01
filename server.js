const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const uuid = require('uuid');

const port = process.env.PORT || 7070;
// const port = 7070;
const server = http.createServer(app.callback()).listen(port);



//Слайд 52 CORS
app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
        return await next();
    }
    const headers = { 'Access-Control-Allow-Origin': '*', };
    if (ctx.request.method !== 'OPTIONS') {
        ctx.response.set({...headers});
        try {
            return await next();
        } catch (e) {
            e.headers = {...e.headers, ...headers};
            throw e;
        }
    }
    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
        });
        if (ctx.request.get('Access-Control-Request-Headers')) {
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
        }
        ctx.response.status = 204; // No content
    }
});

app.use(koaBody({
    urlencoded: true,
    multipart: true,
}));

let ticketList = [];

class Ticket {
    constructor(id, name, description, status, created) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.created = created;
    }
}



app.use(async ctx => {

if (ctx.method === 'GET') {
    const { id } = ctx.request.query;
    if (id) {
      const output = ticketList.filter(ticket => ticket.id == id);
      ctx.response.body = output;
      return;
    }
    ctx.response.body = ticketList.map((ticket) => {
      return {
        id: ticket.id,
        name: ticket.name,
        status: ticket.status,
        created: ticket.created,
      };
    });
    return;
  }

  if (ctx.method === 'POST') {
    const { name, description } = ctx.request.body;
    const id = uuid.v4();
    const created = new Date();
    const status = false;
    const ticket = new Ticket(id, name, description, status, created);
    ticketList.push(ticket);
    ctx.response.body = ticketList;
    return;
  };

  if (ctx.method === 'PUT') {
    const { id, name, description } = ctx.request.body;
    for (let ticket of ticketList) {
        if (ticket.id == id) {
            ticket.name = name;
            ticket.description = description;
        }
    }
    ctx.response.body = 'ticket changed';
    return;
  }

  if (ctx.method === 'PATCH') {
    const { id, status } = ctx.request.query;
    let output = {};
    for (let ticket of ticketList) {
        if (ticket.id == id) {
            ticket.status = status;
            output.status = status;
            output.id = id;
        }
    }
    ctx.response.body = 'ticket status changed';
    return;
  }

  if (ctx.method === 'DELETE') {
    const { id } = ctx.request.query;
    ticketList = ticketList.filter((item) => item.id !== id);
    ctx.response.body = 'ticket deleted';
    return;
  }

});
