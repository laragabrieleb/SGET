import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm"
import { Usuarios } from "./Usuarios";
import { Permissoes } from "./Permissoes";

@Entity("usuariosPermissoes")
export class usuarioPermissoes {
    //coluna como uma chave primária autoincrementável
    @PrimaryGeneratedColumn()
    id?: number
    //colocar as fk (permissoes e usuarios)
    //manytoone: muitos para um 
    @Column("int")
    usuarioId?: number

    @Column("int")
    permissaoId?: number
    //@JoinColumn: coluna da chave 
    //@JoinTable() é usada para criar uma tabela de 
    //ligação automática no banco de dados que armazenará os relacionamentos entre
    //Usuarios e Permissoes
    @ManyToOne(() => Usuarios)
    @JoinColumn({ name: 'usuarioId' }) // Nome da coluna de chave estrangeira para  	Usuarios
    usuario: Usuarios;
  
    @ManyToOne(() => Permissoes)
    @JoinColumn({ name: 'permissaoId' }) // Nome da coluna de chave estrangeira para Permissoes
    permissao: Permissoes;
   
}