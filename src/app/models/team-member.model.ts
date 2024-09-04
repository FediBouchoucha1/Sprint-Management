
export class TeamMember {
  PersonId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  id: any;

  constructor(PersonId: string,firstName: string, lastName: string, email: string, phone: string | null) {
    this.PersonId=PersonId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
  }
}

export class SprintTeamMemberResponse {
  SprintTeamMember: Array<{
    PersonId: string;
    PersonFirstName: string;
    PersonLastName: string;
    PersonEMail: string;
    PersonMobilePhone: string | null;
  }>;

  constructor(SprintTeamMember: Array<{ PersonId:string,PersonFirstName: string, PersonLastName: string, PersonEMail: string, PersonMobilePhone: string | null }>) {
    this.SprintTeamMember = SprintTeamMember;
  }
}

export class PotentialTeamMember {
  id :string ;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;

  constructor(id: string,firstName: string, lastName: string, email: string, phone: string | null) {
    this.id=id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
  }
}
