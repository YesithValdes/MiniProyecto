import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  listas: { id: number, fecha: Date, productos: { id: number, nombre: string, lugar: string }[] }[] = [];
  
  ultimaLista: { id: number, fecha: Date, productos: { id: number, nombre: string, lugar: string }[] } | null = null;

  productos: { id: number, nombre: string, lugar: string }[] = [];
  
  mostrarModal: boolean = false;
  nuevoProducto = { id: 0, nombre: '', lugar: '' };

  mostrarModalEditar = false;
  productoAEditar = { id: 0, nombre: '', lugar: '' };  

  mostrarModalVerListas: boolean = false;

  lugaresDisponibles = ['Tienda A', 'Tienda B', 'Tienda C', 'Supermercado D'];

  listaIdCounter: number = 1;
  productoIdCounter: number = 1; // Nuevo contador para ID de productos

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoProducto = { id: 0, nombre: '', lugar: '' };
  }

  guardarProducto() {
    if (this.nuevoProducto.nombre && this.nuevoProducto.lugar) {
      this.nuevoProducto.id = this.productoIdCounter++; // Asignar un ID único
      if (!this.ultimaLista) {
        this.crearNuevaLista();
      }
      this.ultimaLista?.productos.push({ ...this.nuevoProducto });
      this.cerrarModal();
    } else {
      alert('Por favor, llena todos los campos.');
    }
  }

  abrirModalEdicion(producto: any) {
    this.productoAEditar = { ...producto };
    this.mostrarModalEditar = true;
  }

  guardarEdicionProducto() {
    if (this.ultimaLista) {
      const index = this.ultimaLista.productos.findIndex(p => p.id === this.productoAEditar.id); // Buscar por ID
      if (index !== -1) {
        this.ultimaLista.productos[index] = { ...this.productoAEditar }; // Actualizar el producto
      }
      this.cerrarModalEditar();
    }
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.productoAEditar = { id: 0, nombre: '', lugar: '' };
  }

  eliminarProducto(producto: any) {
    if (this.ultimaLista) {
      this.ultimaLista.productos = this.ultimaLista.productos.filter(p => p.id !== producto.id); // Eliminar por ID
    }
  }

  crearNuevaLista() {
    const nuevaLista = {
      id: this.listaIdCounter++,
      fecha: new Date(),
      productos: []
    };
    this.listas.push(nuevaLista);
    this.ultimaLista = nuevaLista;  // La nueva lista se muestra automáticamente en la interfaz principal.
  }

  eliminarLista(lista: any) {
    this.listas = this.listas.filter(l => l !== lista);
    if (this.listas.length > 0) {
      this.ultimaLista = this.listas[this.listas.length - 1];
    } else {
      this.ultimaLista = null;
    }
  }

  abrirModalVerListas() {
    this.mostrarModalVerListas = true;
  }

  cerrarModalVerListas() {
    this.mostrarModalVerListas = false;
  }
}
