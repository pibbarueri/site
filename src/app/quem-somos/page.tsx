import type { Metadata } from "next";
import { Container, textLink, PageTitle } from "@/components/ui";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Quem somos",
  description:
    "Conheça a história, a fé e o pastor da Primeira Igreja Batista em Barueri, fundada em 1965.",
};

function Topic({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8">
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-4 leading-relaxed text-neutral-200">{children}</div>
    </section>
  );
}

export default function AboutUs() {
  return (
    <>
      <PageTitle title="Quem somos">
        Uma igreja que existe em Barueri desde 1965.
      </PageTitle>

      <Container className="max-w-3xl py-8 sm:py-12">
        <p className="text-lg leading-relaxed">
          Somos, acima de tudo, igreja de Cristo. Somos parte da igreja universal implantada por
          Jesus Cristo na Terra. Somos uma igreja apostólica, uma vez que nossa crença tem raízes
          nos princípios apostólicos afirmados no Novo Testamento. Somos parte do Reino de Deus,
          dedicado a ensinar, edificar, discipular, promover comunhão e viver o amor único e real,
          que vem de Deus. Somos corpo de Cristo.
        </p>

        <Topic title="O que acreditamos">
          <p>
            Cremos que a fé em Jesus Cristo, o Salvador, é o único elo que nos leva a Deus. Cremos
            na divindade e soberania plena de Deus, nas pessoas de Deus Pai, Deus Filho e Espírito
            Santo. Entendemos a Bíblia Sagrada como revelação de Deus, e a temos por única Regra de
            Fé e Prática. Acreditamos no Evangelho como único meio de restaurar o homem de sua
            condição natural de perdição eterna.
          </p>
        </Topic>

        <Topic title="Instituição">
          <p>
            Somos uma igreja evangélica, de confissão Reformada Batista, conforme convenção de
            1689. Somos filiados à Convenção Batista Brasileira (CBB).
          </p>
        </Topic>

        <Topic title="Começo">
          <p>
            Fundada em 1965, nossa igreja surgiu de um trabalho iniciado por cristãos que residiam
            em Barueri e eram membros da Primeira Igreja Batista em Itapevi, São Paulo. Este
            trabalho começou em 1959, e foi organizado em igreja seis anos depois. Estabelecida na
            Rua Vitória, na região central da cidade, a igreja foi o primeiro trabalho Batista
            constituído na cidade, com o fim de reunir cristãos de profissão Batista e anunciar a
            palavra de Deus.
          </p>
        </Topic>

        <section className="border-t border-border py-8">
          <h2 className="text-xl font-bold sm:text-2xl">Pastor</h2>
          <div className="mt-4 rounded-lg border border-border bg-surface p-6">
            <h3 className="text-lg font-semibold">Márcio José Lima da Silva</h3>
            <p className="text-sm text-muted">Pastor titular</p>
            <p className="mt-4 leading-relaxed text-neutral-200">
              Casado com Tatiana Polanczyk desde 2005. Chegou à PIB Barueri em 2012, onde começou
              com o trabalho entre jovens e adolescentes. Em 2014 o trabalho se estendeu a toda a
              igreja. Hoje coordena os ministérios, pastoreia o ministério de música e o ministério
              com surdos, e se dedica ao aconselhamento e ao discipulado.
            </p>

            <details className="mt-4 border-t border-border pt-4">
              <summary className="cursor-pointer text-sm font-semibold underline decoration-brand decoration-2 underline-offset-4 hover:text-white">
                Mais detalhes
              </summary>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-200">
                <p>
                  Convertido em 1995 na Igreja Presbiteriana Independente Getsêmani, em Santos/SP.
                  Trabalhou com jovens de 1998 até 2014. Até o ano de 2002 trabalhou com jovens na
                  IPI Getsêmani. De 2003 a 2004, ficou responsável pela direção de uma Congregação
                  da igreja. De 2005 a 2006, realizou trabalho com adolescentes. De 2006 a 2008,
                  realizou trabalho com jovens na Igreja Batista do Jardim Casqueiro, em Cubatão.
                  De 2009 a 2011, ficou responsável pela direção da Congregação de Areia Branca, da
                  IPI Getsêmani. Paralelo a estes últimos trabalhos, realizou um trabalho na equipe
                  do ECC (Encontro de Casais com Cristo) Santos, de 2008 a 2011. Em 2012, chegou à
                  PIB de Barueri, iniciando com trabalho com jovens e adolescentes, mas expandido
                  para toda a igreja em meados de 2014.
                </p>
                <p>
                  É formado em Teologia pelo Seminário Teológico Batista do Litoral, sendo este
                  revalidado pelo MEC pela Universidade Metodista de São Paulo. Realizou também 1
                  ano de Pós Graduação com ênfase em Ministério Pastoral, pelo Seminário Teológico
                  Batista do Litoral, e uma pós-graduação em Aconselhamento Bíblico (NUTRA – Núcleo
                  de treinamento em aconselhamento).
                </p>
                <p>
                  Realizou um Curso de Gestão por competência, e formado em Psicologia pela
                  Universidade Paulista – UNIP em 2015. Atualmente cursa o Mestrado em Teologia e
                  Exposição Bíblica (SBPV – Seminário Bíblico Palavra da Vida – Atibaia), também
                  treinamento em Aconselhamento Bíblico pela ABCB (Associação Brasileira de
                  Conselheiros Bíblicos) e uma pós-graduação em Língua Brasileira de Sinais –
                  Libras na Universidade Paulista.
                </p>
                <p>
                  Realizou trabalhos missionários pela MEAP (Missão Evangélica de Apoio a
                  Pescadores) e pela JOCUM (Jovens com uma Missão). Foi monitor no STBL (Seminário
                  Teológico Batista do Litoral), auxiliando na matéria MEB, e ministrou cursos na
                  JOCUM (Curitiba/PR e Piratininga/SP).
                </p>
                <p>
                  Atualmente, é pastor na Primeira Igreja Batista em Barueri, desde agosto de 2012.
                  Seu ministério está direcionado a toda a igreja, com enfoque para o Ministério de
                  Louvor, o Ministério de Discipulado, o Ministério com Surdos, o aconselhamento e
                  o ministério do ensino e da pregação, entre outros.
                </p>
                <p>
                  Contato:{" "}
                  <a href={`mailto:${SITE.pastorEmail}`} className={textLink}>
                    {SITE.pastorEmail}
                  </a>
                </p>
              </div>
            </details>
          </div>
        </section>
      </Container>
    </>
  );
}
