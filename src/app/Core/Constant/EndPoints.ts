import { Type } from "@angular/core";
import { create } from "domain";

const api = "http://localhost:8080/edulearn/api" ; 
//const api = "https://edulearn-backend-8coh.onrender.com/edulearn/api"  ;           
const userapi = `${api}/user`; 
const repetitionapi = `${api}/repetition`; 
const marketplaceapi = `${api}/marketplace`; 
const generalapi = `${api}/general`; 
const evaluationapi = `${api}/evaluation`; 
const commentaireapi = `${api}/commentaire`; 
const aiapi = `${api}/ia`; 


export const edulearnDashboard = {
    Auth :{
        login : `${userapi}/login`, 
    }, 
    Parent :{
        all : `${userapi}/parent/all`,
        create : `${userapi}/parent/create`,
        findById : `${userapi}/parent/findById/`,
        changestatus : `${userapi}/parent/status/`,
        delete : `${userapi}/parent/delete/`,
    }, 
    Enseignant :{
        all : `${userapi}/enseignant/all`,
        allBySection : `${userapi}/enseignant/all/bysection/`,
        allByStatus : `${userapi}/enseignant/all/bystatus/`,
        allByProfil : `${userapi}/enseignant/all/byProfil/`,
        count : `${userapi}/enseignant/count/`, 
        create : `${userapi}/enseignant/create`,
        delete : `${userapi}/enseignant/delete/`,
        findById : `${userapi}/enseignant/findById/`,
        changestatus : `${userapi}/change/status/`,
    }, 

    Eleve :{
        allByParent : `${userapi}/eleve/allbyparent/`,
        countByParent : `${userapi}/eleve/countbyParent/`,
        create : `${userapi}/eleve/create`,
    }, 
    OffreRepetition :{
        all : `${repetitionapi}/new/offre/all`,
        allbyparent : `${repetitionapi}/new/offre/all/byparent/`,
        createnew : `${repetitionapi}/new/offre/create`,
        delete : `${repetitionapi}/new/offre/delete/`,
        //Candidature
        Candidature:{
            all : `${repetitionapi}/candidature/all`,
            allByOffre : `${repetitionapi}/candidature/allbyoffre/`,
            allByEnseignant : `${repetitionapi}/candidature/allbyenseignant/`,
            create : `${repetitionapi}/candidature/create`,
            update : `${repetitionapi}/candidature/update`,
            delete : `${repetitionapi}/candidature/delete/`,
            
        }, 
        //Matiere offre
        MatiereOffre : {
            allByOffre : `${repetitionapi}/new/matiere-offre/allbyoffre/`,
            create : `${repetitionapi}/offre/matiere-offre/create`,
        }
    }, 
    SessionRepetition :{
        all : `${repetitionapi}/all`,
        findByEnseignant : `${repetitionapi}/allsession/byenseignant/`,
        create : `${repetitionapi}/create`,
        update : `${repetitionapi}/update`,
        delete : `${repetitionapi}/delete/`,
        findByParent : `${repetitionapi}/all/byparent/`,


        //Matiere repetition 
        MatiereRepetition : {
            allByRepetition : `${repetitionapi}/matiere-repetition/all/byrepetition/`,
            create : `${repetitionapi}/matiere-repetition/create`,
            allmatierebyrepetition : `${repetitionapi}/matiere-repetition/allmatiere/byreptition/`,
            allmatierebyeleve : `${repetitionapi}/matiere-repetition/allmatiere/byeleve/`,
        },  
        HoraireRepetition :{
             allByRepetition : `${repetitionapi}/horaire-repetition/all/byrepetition/`,
             create : `${repetitionapi}/horaire-repetition/create`,
        }
    }, 
    
    MarketPlace :{
        all : `${marketplaceapi}/new/all`,
        findbyid : `${marketplaceapi}/new/findbyid/`,
        create : `${marketplaceapi}/new/create`,
        update: `${marketplaceapi}/new/update`,
        delete: `${marketplaceapi}/new/delete/`,
        allType : `${marketplaceapi}/typeRessource/all`,
          Support: {
            all:       `${marketplaceapi}/new/all`,
            findbyid:  `${marketplaceapi}/new/findbyid/`,   // + id
            create:    `${marketplaceapi}/new/create`,
            update:    `${marketplaceapi}/new/update`,
            delete:    `${marketplaceapi}/new/delete/`,     // + id
        }
    }, 
    
    General :{
        Section :{
            all : `${generalapi}/section/all`,
            create : `${generalapi}/section/create`,
            update : `${generalapi}/section/update`,
            delete : `${generalapi}/section/delete/`,
        },

        Niveau :{
            all : `${generalapi}/niveau/all`,
            allBySection : `${generalapi}/niveau/allbySection/`,
            create : `${generalapi}/niveau/create`,
            update : `${generalapi}/niveau/update`,
            delete : `${generalapi}/niveau/delete/`,
        },
        Filiere :{
            all : `${generalapi}/filiere/all`,
            allBySection : `${generalapi}/filiere/allbySection/`,
            create : `${generalapi}/filiere/create`,
            update : `${generalapi}/filiere/update`,
            delete : `${generalapi}/filiere/delete/`,
        },
        ProfilEnseignant :{
            all : `${generalapi}/profil-enseignant/all`,
            create : `${generalapi}/profil-enseignant/create`,
            delete : `${generalapi}/profil-enseignant/delete/`,
        }, 

        StatusEnseignant :{
            all : `${generalapi}/status-enseignant/all`,
            create : `${generalapi}/status-enseignant/create`,
            delete : `${generalapi}/status-enseignant/delete/`,
        },
        Diplome :{
            all : `${generalapi}/diplome/all`,
            create : `${generalapi}/diplome/create`,
            delete : `${generalapi}/diplome/delete/`,
        },

        Matiere :{
            all : `${generalapi}/matiere/all`,
            allBySection : `${generalapi}/matiere/allbySection/`,
            create : `${generalapi}/matiere/create`,
            delete : `${generalapi}/matiere/delete/`,
        },


        CategorieMatiere :{
            all : `${generalapi}/categorie-matiere/all`,
            allBySection : `${generalapi}/categorie-matiere/allbySection/`,
            create : `${generalapi}/categorie-matiere/create`,
            delete : `${generalapi}/categorie-matiere/delete/`,
        },

    }, 

    Evaluation : {
        Composition : {
            allbyenseignant : `${evaluationapi}/composition/all/byenseignant/`,
            allbymatiere : `${evaluationapi}/composition/all/bymatiere/`,
            allNonArchivedbyEleve : `${evaluationapi}/composition/nonarchived/byeleve/`,
            allNonArchivedbyMatiere : `${evaluationapi}/composition/nonarchived/bymatiere/`,
            create : `${evaluationapi}/composition/create`,
            update : `${evaluationapi}/composition/update`,
            delete : `${evaluationapi}/composition/delete/`,
        }, 

        Question : {
            allbycomposition : `${evaluationapi}/question/all/bycomposition/`,
            create : `${evaluationapi}/question/create`,
            update : `${evaluationapi}/question/update`,
            delete : `${evaluationapi}/question/delete/`,
        }, 

        ReponsePossible : {
            allByQuestion : `${evaluationapi}/reponse-possible/all/byquestion/`,
            isTruebyQuestion : `${evaluationapi}/reponse-possible/istrue/byquestion/`,
            create : `${evaluationapi}/reponse-possible/create`,
            update : `${evaluationapi}/reponse-possible/update`,
            validate : `${evaluationapi}/reponse-possible/validate/`,
            delete : `${evaluationapi}/reponse-possible/delete/`,
        } , 

        TentativeEvaluation : {
            allbyeleve : `${evaluationapi}/tentative-evaluation/all/byeleve/`,
            findByComposition : `${evaluationapi}/tentative-evaluation/all/bycomposition/`,
            findByEleveAndMatiere : `${evaluationapi}/tentative-evaluation/findby/eleve/matiere/`,
            create : `${evaluationapi}/tentative-evaluation/create`,
            update : `${evaluationapi}/tentative-evaluation/update`,
            delete : `${evaluationapi}/tentative-evaluation/delete/`,
            noteFinal : `${evaluationapi}/tentative-evaluation/notefinale/bytentative/`,
            nettoyage : `${evaluationapi}/tentative-evaluation/nettoyage/`,
        }, 
        ReponseEleve : {
            allbytentative : `${evaluationapi}/reponse-eleve/all/bytentative/`,
            byquestion : `${evaluationapi}/reponse-eleve/byquestion/`,
            create : `${evaluationapi}/reponse-eleve/create`,
            update : `${evaluationapi}/reponse-eleve/update`,
            delete : `${evaluationapi}/reponse-eleve/delete/`,
        },
        TypeEvaluation : {
            all : `${evaluationapi}/type-evaluation/all`,
            create : `${evaluationapi}/type-evaluation/create`,
            delete : `${evaluationapi}/type-evaluation/delete/`,
        }
        

    }, 

    IA :{
        assistant : `${aiapi}/assistant`, 
        matchingForOffre : `${aiapi}/matching/offre-multienseignant/`,
        create : `${aiapi}/matching/db/create`, 
        allbyoffre : `${aiapi}/matching/db/findbyoffre/`, 
        allByEnseignant : `${aiapi}/matching/db/findbyenseignant/`

    }, 
    Commentaire:{
        allByEnseignant : `${commentaireapi}/all/byenseignant/`,
        allByParent : `${commentaireapi}/all/byenseignant/`,
        create : `${commentaireapi}/all/create/`,
        update : `${commentaireapi}/all/update/`,
        delete : `${commentaireapi}/all/delete/`,
    }

}

export const imageStoreUrl = "http://localhost:4200/assets/file/support/";