import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../firebase-config';
import { collection, setDoc, doc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  listas: { id: number, fecha: Date, productos: { id: number, nombre: string, lugar: string, comprado: boolean }[] }[] = [];
  ultimaLista: { id: number, fecha: Date, productos: { id: number, nombre: string, lugar: string, comprado: boolean }[] } | null = null;

  productos: { id: number, nombre: string, lugar: string, comprado: boolean }[] = [];

  mostrarModal: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVerListas: boolean = false;
  mostrarModalInfoLista: boolean = false;
  listaSeleccionada: any = null;

  nuevoLugar: string = '';

  nuevoProducto = { id: 0, nombre: '', lugar: '', comprado: false };
  productoAEditar = { id: 0, nombre: '', lugar: '', comprado: false };

  lugaresDisponibles = ['Tienda A', 'Tienda B', 'Tienda C', 'Supermercado D'];

  listaIdCounter: number = 1;
  productoIdCounter: number = 1;

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoProducto = { id: 0, nombre: '', lugar: '', comprado: false };
  }

  guardarProducto() {
    if (this.nuevoProducto.nombre && this.nuevoProducto.lugar) {
      this.nuevoProducto.id = this.productoIdCounter++;
      if (!this.ultimaLista) {
        this.crearNuevaLista();
      }
      this.ultimaLista?.productos.push({ ...this.nuevoProducto });
      this.cerrarModal();
      this.enviarDatosAFirestore();
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
      const index = this.ultimaLista.productos.findIndex(p => p.id === this.productoAEditar.id);
      if (index !== -1) {
        this.ultimaLista.productos[index] = { ...this.productoAEditar };
      }
      this.cerrarModalEditar();
      this.enviarDatosAFirestore();
    }
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.productoAEditar = { id: 0, nombre: '', lugar: '', comprado: false };
  }

  marcarComoComprado(producto: any) {
    producto.comprado = !producto.comprado;
    this.enviarDatosAFirestore();
  }

  eliminarProducto(producto: any) {
    if (!producto.comprado && this.ultimaLista) {  // Solo permite eliminar si 'comprado' es falso
      this.ultimaLista.productos = this.ultimaLista.productos.filter(p => p.id !== producto.id);
      this.enviarDatosAFirestore();
    } else {
      alert('No puedes eliminar un producto que ya ha sido marcado como comprado.');
    }
  }

  crearNuevaLista() {
    const nuevaLista = {
      id: this.listaIdCounter++,
      fecha: new Date(),
      productos: []
    };
    this.listas.push(nuevaLista);
    this.ultimaLista = nuevaLista;
  }

  async eliminarLista(lista: any) {
    try {
      const listaDocRef = doc(collection(db, 'listas'), lista.id.toString());
      await deleteDoc(listaDocRef);
      console.log(`Lista con ID ${lista.id} eliminada de Firestore`);

      this.listas = this.listas.filter(l => l.id !== lista.id);
      if (this.listas.length > 0) {
        this.ultimaLista = this.listas[this.listas.length - 1];
      } else {
        this.ultimaLista = null;
      }

    } catch (error) {
      console.error('Error al eliminar la lista en Firestore:', error);
    }
  }

  abrirModalVerListas() {
    this.mostrarModalVerListas = true;
  }

  cerrarModalVerListas() {
    this.mostrarModalVerListas = false;
  }

  abrirModalInfoLista(lista: any): void {
    this.listaSeleccionada = lista;
    this.mostrarModalInfoLista = true;
  }

  cerrarModalInfoLista(): void {
    this.listaSeleccionada = null;
    this.mostrarModalInfoLista = false;
  }

  agregarLugar(): void {
    if (this.nuevoLugar.trim()) {
      this.lugaresDisponibles.push(this.nuevoLugar.trim());
      this.nuevoLugar = '';
    } else {
      alert('Por favor, ingresa un nombre válido para el lugar.');
    }
  }

  async enviarDatosAFirestore() {
    try {
      const listasCollection = collection(db, 'listas');

      for (const lista of this.listas) {
        const listaDocRef = doc(listasCollection, lista.id.toString());
        await setDoc(listaDocRef, { ...lista }, { merge: true });
        console.log('Lista con ID', lista.id, 'actualizada o creada en Firestore');
      }

      console.log('Todas las listas actualizadas/creadas en Firestore');

    } catch (error) {
      console.error('Error al actualizar/crear datos en Firestore:', error);
    }
  }
}
