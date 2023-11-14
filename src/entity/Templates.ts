import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany, JoinColumn, ManyToOne } from "typeorm"
import { usuarioPermissoes } from "./UsuariosPermissoes"
import { Usuarios } from "./Usuarios"
import { Colunas } from "./Colunas"

//representa a tabela usuarios no banco de dados
@Entity("templates")
export class Templates {
    //coluna como uma chave primária autoincrementável
    @PrimaryGeneratedColumn()
    id: number 

    //as colunas devem ser mapeadas iguais ao banco de dados 
    @Column("varchar", { length: 50 })
    nome: string

    @Column("varchar", { length: 100 })
    descricao: string

    @Column("int", { nullable: true})
    minLinhas: number | undefined

    @Column("int", { nullable: true})
    maxLinhas: number | undefined

    @Column("int", { nullable: false})
    qtdColunas: number | undefined


    @Column("varchar", {length: 4})
    extensao: string

    @Column("bool")
    situacao: boolean

    @Column("varchar", { length: 20 })
    criadopor: string

    @Column("timestamp")
    datacriacao: Date

    @Column("varchar", { length: 500, nullable: true })
    caminho: string

    @Column("int")
    usuarioId?: number

    @ManyToOne(() => Usuarios)
    @JoinColumn({ name: 'usuarioId' }) // Nome da coluna de chave estrangeira para  	Usuarios
    usuario: Usuarios;

    @OneToMany(() => Colunas, (coluna) => coluna.template)
    colunas: Colunas[];
}


export function nomeTemplateEhValido(nome: string): boolean {
    if (nome.length < 45) {
        return true;
    } else {
        return false;
    }
}

export function descricaoTemplateEhValida(descricao: string): boolean {
    if (descricao.length < 100) {
        return true;
    } else {
        return false;
    }
}


